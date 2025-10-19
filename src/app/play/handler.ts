// handler.ts
import axios from "axios";
import type * as types from "./types";
import type { TrackItem } from "@/types/musicTypes";

const api = axios.create({
    baseURL: "/",
    timeout: 8000,
    withCredentials: false,
});

const axMsg = (e: unknown) =>
    axios.isAxiosError(e)
        ? (e.response?.data?.error ?? e.message)
        : ((e as Error)?.message ?? String(e));

async function fetchTrack(trackId: string): Promise<TrackItem> {
    const { data } = await api.get<TrackItem>("/api/music/track", {
        params: { trackId },
    });
    return data;
}

export function msToMMSS(ms: number) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function fetchPlaylistDate(): Promise<TrackItem[]> {
    try {
        const { data: today } = await api.get<
            Array<{ id: string; streamDate: string; title: string }>
        >("/api/music/playlists/today");
        if (!today?.length) return [];

        const pl = today[0];

        const { data: detail } = await api.get<types.trackDetail[]>(
            `/api/music/playlists/${pl.id}`
        );
        if (!detail?.length) return [];

        const items = await Promise.allSettled(
            detail.map(async (d) => {
                const track = await fetchTrack(d.trackId);
                return { ...track, orderIndex: d.orderIndex } as TrackItem;
            })
        );

        const okItems: TrackItem[] = items
            .filter((r): r is PromiseFulfilledResult<TrackItem> => r.status === "fulfilled")
            .map((r) => r.value);

        okItems.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        return okItems;
    } catch (e) {
        console.error("fetchPlaylistDate:", axMsg(e));
        return [];
    }
}

export async function playOnThisDevice(
    deviceId: string,
    trackId: string,
    sessionKey: string
): Promise<boolean> {
    try {
        const { data, status } = await api.post<{ ok: boolean; error?: string }>(
            "/api/music/play",
            { deviceId, trackId, sessionKey }
        );

        if (!data?.ok) {
            console.error("Spotify play API failed:", {
                status,
                error: data?.error,
                deviceId,
                trackId,
            });

            return false;
        }
        return true;
    } catch (e) {
        const errorMsg = axMsg(e);
        console.error("playOnThisDevice failed:", {
            error: errorMsg,
            deviceId,
            trackId,
            sessionKey: sessionKey ? "present" : "missing",
        });

        return false;
    }
}

export async function getAccessToken(tokenKey: string): Promise<string> {
    const res = await axios.post("/api/auth/getToken", { provider: "SPOTIFY", tokenKey });

    if (!res.data.ok) {
        throw new Error(res.data.error ?? `token fetch failed (${res.status})`);
    }
    return res.data.accessToken as string;
}
