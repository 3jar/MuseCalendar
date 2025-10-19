"use client";

import { memo, useState } from "react";
import useLoader from "@/hook/useLoader";
import useWindowMetrics from "@/hook/useWindowMetrics";
import { useSpotifySDK, usePlaylist } from "./hooks/useSpotifySDK";
import { useAppSession } from "@/hook/useAppSession";
import usePallete from "./hooks/usePallete";

import * as ui from "./ui";
import { ForwardIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import styles from "@/styles/sliderStyle.module.css";

import { cn } from "@/lib/cn";
import Image from "next/image";
import * as handler from "./handler";

function Client() {
    const sdkLoader = useLoader();
    const metrics = useWindowMetrics();
    const { playlistItems } = usePlaylist();
    const { session } = useAppSession();
    const { enabled, states, actions } = useSpotifySDK(sdkLoader, session!, playlistItems);
    const { pallete, extractPaletteFrom } = usePallete();

    const [audioReady, setAudioReady] = useState(false);

    return (
        <main
            className="relative overflow-hidden min-h-screen flex justify-center items-center"
            style={{ height: `${metrics.innerHeight}px` }}
        >
            <ui.PrograssOverlay sdkLoader={sdkLoader} />

            {enabled && states.track && sdkLoader.state === "success" && (
                <>
                    <Image
                        src={states.track.album.images[0].url}
                        alt={states.track.name ?? "album art"}
                        fill
                        sizes="100vw"
                        className="absolute inset-0 object-cover blur-2xl scale-110 brightness-75 pointer-events-none"
                        priority
                        quality={90}
                    />
                    <div className="w-2/3 p-1 m-auto rounded-sm shadow-2xl z-10 bg-black border-gray-500 overflow-hidden">
                        <div className="grid grid-cols-5 gap-1">
                            <div className="col-span-2 flex justify-center items-center aspect-square overflow-hidden">
                                <Image
                                    src={states.track.album.images[0].url}
                                    alt={states.track.name ?? "album art"}
                                    width={640}
                                    height={640}
                                    className="rounded object-cover"
                                    priority
                                    quality={90}
                                    unoptimized
                                    crossOrigin="anonymous"
                                    onLoadingComplete={(img) => extractPaletteFrom(img)}
                                />
                            </div>

                            <div className="relative flex-1 w-auto h-full col-span-3 px-2 py-3">
                                <div
                                    className="overflow-y-scroll"
                                    style={{
                                        maxHeight: metrics.innerWidth
                                            ? `calc((${metrics.innerWidth}px * 2/3 - 8px) * 2/5 - 118px)`
                                            : undefined, // SSR 초기 렌더에서는 undefined로 두고, 클라이언트에서 즉시 갱신
                                    }}
                                >
                                    <ul>
                                        {playlistItems.map((t) => (
                                            <button
                                                type="button"
                                                key={t.trackId}
                                                className={cn(
                                                    "w-full mb-[10px] flex justify-start items-center gap-3 p-2 rounded-sm hover:bg-neutral-800 cursor-pointer duration-150 overflow-x-visible",
                                                    states.trackOrder === t.orderIndex &&
                                                        "!bg-white"
                                                )}
                                                onClick={() =>
                                                    actions.handleOrder(0, t.orderIndex!)
                                                }
                                            >
                                                <div>
                                                    <div
                                                        className={cn(
                                                            "flex justify-start font-bold text-white duration-150",
                                                            states.trackOrder === t.orderIndex &&
                                                                "text-green-500"
                                                        )}
                                                    >
                                                        {t.name}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "text-xs text-white flex justify-start",
                                                            states.trackOrder === t.orderIndex &&
                                                                "text-black"
                                                        )}
                                                    >
                                                        {t.artists.join(", ")} · {t.album} ·{" "}
                                                        {handler.msToMMSS(t.durationMs)}
                                                    </div>
                                                    <div className="mt-1 flex gap-2">
                                                        {t.previewUrl && (
                                                            <audio
                                                                controls
                                                                src={t.previewUrl}
                                                                className="h-8"
                                                            >
                                                                Your browser does not support audio.
                                                            </audio>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </ul>
                                </div>
                                <div className="w-full h-[90px] bg-linear-30">
                                    <div className="relative flex flex-col justify-end w-full h-full">
                                        <div>
                                            <div className="font-bold text-white">
                                                {states.track.name}
                                            </div>
                                            <div className="text-sm text-white">
                                                {states.track.artists
                                                    .map((a: any) => a.name)
                                                    .join(", ")}
                                            </div>
                                        </div>
                                        <div className="flex mt-2">
                                            <div className="flex w-full items-center gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    disabled={states.trackOrder <= 1}
                                                    className={cn(
                                                        "h-5 w-5 cursor-pointer transition-transform duration-150",
                                                        "hover:scale-[1.15] active:!scale-90 active:hover:!scale-90",
                                                        "disabled:opacity-50 disabled:text-gray-500 disabled:cursor-not-allowed",
                                                        "disabled:scale-100 disabled:hover:scale-100 disabled:active:scale-100"
                                                    )}
                                                    onClick={() => actions.handleOrder(-1)}
                                                >
                                                    <ForwardIcon className="text-white h-full transform scale-x-[-1]" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (!audioReady) {
                                                            actions.activate();
                                                            setAudioReady(true);
                                                        }
                                                        actions.toggle();
                                                    }}
                                                    className="h-6 w-6 cursor-pointer transition-transform duration-150 hover:scale-[1.15] active:!scale-90 active:hover:!scale-90"
                                                >
                                                    {states?.paused ? (
                                                        <PlayIcon className="text-white h-full" />
                                                    ) : (
                                                        <PauseIcon className="text-white h-full" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        states.trackOrder >= playlistItems.length
                                                    }
                                                    className={cn(
                                                        "h-5 w-5 cursor-pointer transition-transform duration-150",
                                                        "hover:scale-[1.15] active:!scale-90 active:hover:!scale-90",
                                                        "disabled:opacity-50 disabled:text-gray-500 disabled:cursor-not-allowed",
                                                        "disabled:scale-100 disabled:hover:scale-100 disabled:active:scale-100"
                                                    )}
                                                    onClick={() => actions.handleOrder(1)}
                                                >
                                                    <ForwardIcon className="text-white h-full" />
                                                </button>
                                                <div className="group flex-1 flex items-center">
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={states.duration || 1}
                                                        step={1000}
                                                        value={states.position}
                                                        onChange={(e) =>
                                                            actions.setPos(
                                                                Number(e.currentTarget.value)
                                                            )
                                                        }
                                                        onMouseUp={(e) =>
                                                            actions.seek(
                                                                Number(
                                                                    (
                                                                        e.currentTarget as HTMLInputElement
                                                                    ).value
                                                                )
                                                            )
                                                        }
                                                        onTouchEnd={(e) =>
                                                            actions.seek(
                                                                Number(
                                                                    (
                                                                        e.currentTarget as HTMLInputElement
                                                                    ).value
                                                                )
                                                            )
                                                        }
                                                        className={cn(
                                                            "w-full hover:cursor-pointer",
                                                            styles.rangeSlider
                                                        )}
                                                        style={{
                                                            background: `linear-gradient(to right,
                                                      rgb(34 197 94) 0%,
                                                      rgb(34 197 94) ${(states.position / states.duration) * 100}%,
                                                      #fafaff ${(states.position / states.duration) * 100}%,
                                                      #fafaff 100%)`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="pointer-events-none absolute -bottom-1/2 left-[700px] w-[1000px] h-[1000px] rounded-full -z-10"
                            style={{
                                background: `radial-gradient(circle, ${pallete[0]} 0%, rgba(255,255,255,0) 70%)`,
                            }}
                        />
                    </div>
                </>
            )}
        </main>
    );
}
export default memo(Client);
