import { useEffect, useState, useRef, useCallback, useMemo } from "react";

import * as handler from "../handler";
import { UseLoaderReturn } from "@/hook/useLoader";

import { TrackItem } from "@/types/musicTypes";
import { AppSession } from "@/types/auth";

export function usePlaylist() {
    const [playlistItems, setPlaylistItems] = useState<TrackItem[]>([]);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return; // 한 번만 로드

        let alive = true;
        (async () => {
            const tracks = await handler.fetchPlaylistDate();
            if (!alive || !tracks) return;
            setPlaylistItems(tracks);
            loadedRef.current = true;
        })();
        return () => {
            alive = false;
        };
    }, []);

    return { playlistItems };
}

export function useSpotifySDK(
    sdkLoader: UseLoaderReturn,
    session: AppSession,
    playlistItems: TrackItem[]
) {
    const ready = useSDKReady(sdkLoader);
    const hasLinked = !!session?.spotify;
    const tokenKey = session?.spotify?.tokenKey ?? null;
    const hasPremium = session?.spotify?.product === "premium";
    const enabled = ready && hasPremium && !!tokenKey && hasLinked;

    const { playerRef, deviceId, state, reconnect, activate } = useSDKPlayer(
        sdkLoader,
        0.5,
        tokenKey,
        enabled
    );

    const { states, actions } = useTrackState(state, playerRef, playlistItems.length);

    useEffect(() => {
        const p = playerRef.current;
        if (!p) return;
        if (!enabled) {
            try {
                p.disconnect?.();
            } catch {}
        }
    }, [enabled, playerRef]);

    const lastPlayedRef = useRef<string | null>(null);
    const isPlayingRef = useRef(false);
    const lastTrackOrderRef = useRef<number | null>(null);

    // trackOrder가 변경되면 lastPlayed를 리셋
    useEffect(() => {
        if (lastTrackOrderRef.current !== null && lastTrackOrderRef.current !== states.trackOrder) {
            lastPlayedRef.current = null;
            console.log("Track order changed, resetting last played track");
        }
        lastTrackOrderRef.current = states.trackOrder;
    }, [states.trackOrder]);

    useEffect(() => {
        if (!enabled) return;
        if (!deviceId || !playlistItems?.length) return;
        if (!playerRef.current || !playerRef.current.ready) return;

        const idx = Math.max(
            0,
            Math.min((states.trackOrder ?? 1) - 1, Math.max(playlistItems.length - 1, 0))
        );
        const trackId = playlistItems[idx]?.trackId;
        if (!trackId) return;

        if (lastPlayedRef.current === trackId || isPlayingRef.current) return;

        lastPlayedRef.current = trackId;
        isPlayingRef.current = true;

        (async () => {
            try {
                await handler.playOnThisDevice(deviceId, trackId, tokenKey);
            } catch (e) {
                console.error("auto play failed:", e);
                lastPlayedRef.current = null;
            } finally {
                isPlayingRef.current = false;
            }
        })();
    }, [enabled, deviceId, playlistItems, states.trackOrder, tokenKey]);

    const guardedActions = useMemo(() => {
        const guard = <T extends (...args: any[]) => any>(fn: T): T =>
            ((...a: any[]) => {
                if (!enabled) return;
                return fn(...a);
            }) as T;

        return {
            toggle: guard(actions.toggle),
            seek: guard(actions.seek),
            setVol: guard(actions.setVol),
            handleOrder: guard(actions.handleOrder),
            setTrackOrder: guard(actions.setTrackOrder),
            activate: guard(activate),
            reconnect: guard(reconnect),
            setPos: guard(actions.setPos),
        };
    }, [actions, activate, reconnect, enabled]);

    // 6) 항상 같은 모양으로 반환
    return useMemo(
        () => ({
            enabled,
            states, // { volume, position, duration, track, trackOrder }
            actions: guardedActions,
        }),
        [enabled, states.trackOrder, states.paused, states.track?.id, guardedActions]
    );
}

export function useSDKReady(sdkLoader: UseLoaderReturn) {
    const [sdkReady, setSdkReady] = useState(false);

    useEffect(() => {
        sdkLoader.start();
        sdkLoader.message("Spotify SDK 스크립트 로딩 중...");

        if ((window as any).Spotify?.Player) {
            sdkLoader.message("Spotify SDK 이미 로드됨");
            setSdkReady(true);
            return;
        }

        const prevHandler = (window as any).onSpotifyWebPlaybackSDKReady;

        (window as any).onSpotifyWebPlaybackSDKReady = () => {
            sdkLoader.message("Spotify SDK 스크립트 로드 완료");
            setSdkReady(true);
        };

        return () => {
            (window as any).onSpotifyWebPlaybackSDKReady = prevHandler;
        };
    }, []);

    return sdkReady;
}

function useTrackState(state: any, playerRef: React.RefObject<any>, listLen: number) {
    const [volume, setVolume] = useState(1);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [track, setTrack] = useState<any>(null);
    const [trackOrder, setTrackOrder] = useState<number>(1);
    const [paused, setPaused] = useState<boolean>(false);

    const toggle = useCallback(() => {
        playerRef.current?.togglePlay();
    }, [playerRef]);

    useEffect(() => {
        setPaused(state?.paused ?? false);
    }, [state]);

    const seek = useCallback(
        (ms: number) => {
            playerRef.current?.seek(ms);
            setPosition(ms);
        },
        [playerRef]
    );

    const setPos = useCallback((ms: number) => {
        setPosition(ms);
    }, []);

    const setVol = useCallback(
        (v: number) => {
            setVolume(v);
            playerRef.current?.setVolume(v).catch(() => {});
        },
        [playerRef]
    );

    const handleOrder = useCallback(
        (add: number, absolute?: number) => {
            setTrackOrder((prev) => {
                const base = typeof absolute === "number" ? absolute : prev;
                const next = base + add;
                const max = listLen;
                return Math.min(Math.max(next, 1), max);
            });
        },
        [listLen]
    );

    useEffect(() => {
        setPosition(state?.position ?? 0);
        setDuration(state?.duration ?? 0);
        setTrack(state?.track_window?.current_track ?? null);
    }, [state]);

    useEffect(() => {
        if (!state) return;
        const nearEnd = (position ?? 0) >= (duration ?? 0) - 1000;
        if (state.paused && state.position === 0 && nearEnd && trackOrder < listLen) {
            handleOrder(1);
        }
    }, [state, position, duration, handleOrder, trackOrder, listLen]);

    const [uiPosition, setUIPosition] = useState(position);
    const positionRef = useRef(position);

    useEffect(() => {
        positionRef.current = position;
        setUIPosition(position);
    }, [position]);

    useEffect(() => {
        if (!state || state.paused) return;

        let lastUpdate = Date.now();
        const id = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastUpdate;
            const newPosition = Math.min(positionRef.current + elapsed, duration);

            setUIPosition(newPosition);
            positionRef.current = newPosition;
            lastUpdate = now;
        }, 1000);

        return () => clearInterval(id);
    }, [state?.paused, duration]);

    const value = useMemo(() => {
        const states = { volume, position: uiPosition, duration, track, trackOrder, paused };
        const actions = { toggle, seek, setVol, handleOrder, setTrackOrder, setPos };
        return { states, actions };
    }, [paused, volume, uiPosition, duration, track?.id, trackOrder, toggle, seek, handleOrder]);

    return value;
}

function useSDKPlayer(
    sdkLoader: UseLoaderReturn,
    volume: number,
    tokenKey: string | null,
    enabled: boolean
) {
    const playerRef = useRef<any>(null);
    const createdRef = useRef(false);

    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [state, setState] = useState<any>(null);

    const provideToken = useCallback(
        async (cb: (token: string) => void) => {
            try {
                sdkLoader.message("Spotify 액세스 토큰 요청 중...");
                if (!tokenKey || !enabled) {
                    sdkLoader.message("액세스 토큰 획득 실패");
                    sdkLoader.fail();
                    return;
                }
                const token = await handler.getAccessToken(tokenKey);
                sdkLoader.message("액세스 토큰 획득 성공");
                cb(token);
            } catch (err) {
                sdkLoader.message("액세스 토큰 획득 실패");
                sdkLoader.fail();
                console.error("failed to provide OAuth token", err);
            }
        },
        [tokenKey, enabled]
    );

    useEffect(() => {
        if (!enabled) return;
        const g = window as any;
        if (!g.Spotify?.Player) {
            sdkLoader.message("Spotify Player 클래스를 찾을 수 없음");
            return;
        }
        if (createdRef.current) return; // 중복 생성 방지

        sdkLoader.start();
        sdkLoader.message("Spotify Player 인스턴스 생성 중...");

        const player = new g.Spotify.Player({
            name: "MuseCalendar Player",
            getOAuthToken: provideToken,
            volume,
        });

        playerRef.current = player;
        createdRef.current = true;

        player.addListener("ready", async ({ device_id }: any) => {
            sdkLoader.message("Spotify Player 준비 완료");
            console.log("Spotify Player ready with device ID:", device_id);
            setDeviceId(device_id);

            // ready 상태를 player 객체에도 설정
            player.ready = true;

            sdkLoader.succeed();
        });
        player.addListener("player_state_changed", (s: any) => setState(s || null));
        player.addListener("initialization_error", (e: any) => {
            sdkLoader.message("Player 초기화 오류");
            sdkLoader.fail();
            console.error("init_error", e);
        });
        player.addListener("authentication_error", (e: any) => {
            sdkLoader.message("Spotify 인증 오류");
            sdkLoader.fail();
            console.error("auth_error", e);
        });
        player.addListener("account_error", (e: any) => {
            sdkLoader.message("Spotify 계정 오류");
            sdkLoader.fail();
            console.error("account_error", e);
        });
        player.addListener("playback_error", (e: any) => {
            sdkLoader.message("재생 오류 발생");
            console.error("playback_error", e);
        });
        player.addListener("not_ready", ({ device_id }: any) => {
            console.log("Device has gone offline", device_id);
            player.ready = false;
        });

        sdkLoader.message("Spotify Player 연결 시도 중...");
        player.connect();

        return () => {
            try {
                player.disconnect();
            } finally {
                playerRef.current = null;
                createdRef.current = false;
            }
        };
    }, [volume, enabled]);

    const reconnect = useCallback(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
            p.disconnect();
            setTimeout(() => p.connect(), 600);
        } catch (e) {
            console.error("reconnect failed", e);
        }
    }, []);

    const activate = useCallback(() => {
        playerRef.current?.activateElement?.();
    }, []);

    return { playerRef, deviceId, state, reconnect, activate };
}

// function useSDKStream(trackId: string, deviceId: string) {
//     const lastPlayed = useRef<string | null>(null);

//     useEffect(() => {
//         if (!deviceId || !trackId) return;
//         if (lastPlayed.current === trackId) return;
//         lastPlayed.current = trackId;

//         (async () => {
//             try {
//                 await handler.playOnThisDevice(deviceId, trackId);
//             } catch (err) {
//                 console.error("Failed to play:", err);
//             }
//         })();
//     }, [deviceId, trackId]);
// }
