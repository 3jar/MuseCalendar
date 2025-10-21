"use client";
import Image from "next/image";
import { TrackItem } from "@/types/musicTypes";
import { cn } from "@/lib/cn";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

interface SearchTrackProps {
    compHeight: number;
    items: TrackItem[];
    selected: TrackItem[];
    removeFromTray: (arg: string) => void;
    addToTray: (arg: TrackItem) => void;
    msToMMSS: (arg: number) => string;
}

export default function SearchTrcack({
    items,
    selected,
    removeFromTray,
    addToTray,
    msToMMSS,
}: SearchTrackProps) {
    return (
        <ul className="mt-4 space-y-4 rounded">
            {items.map((t) => (
                <li
                    key={t.trackId}
                    className={cn(
                        "relative flex items-center gap-3 p-1",
                        "overflow-hidden bg-background rounded border border-neutral-700 cursor-pointer",
                        "duration-100 hover:border-foreground/50 hover:bg-transparent",
                        selected.find((s) => s.trackId === t.trackId) &&
                            "bg-neutral-900 border-green-900"
                    )}
                >
                    {t.imageUrl && (
                        <>
                            <Image
                                src={t.imageUrl}
                                alt=""
                                width={100}
                                height={100}
                                className="rounded-l -m-1 z-5"
                            />
                            <Image
                                src={t.imageUrl}
                                alt=""
                                fill
                                sizes="100vw"
                                className="absolute inset-0 object-cover blur-2xl scale-110 brightness-75 pointer-events-none -z-5"
                                priority
                                quality={90}
                            />
                        </>
                    )}
                    <div className="z-5 flex justify-between w-full h-full">
                        <div className="h-full flex flex-col justify-end">
                            <span className="font-bold">{t.name}</span>
                            <span className="text-xs text-neutral-400">
                                {t.artists.join(", ")} · {t.album} · {msToMMSS(t.durationMs)}
                            </span>
                        </div>
                        <button
                            onClick={
                                selected.find((s) => s.trackId === t.trackId)
                                    ? () => removeFromTray(t.trackId)
                                    : () => addToTray(t)
                            }
                            className={cn(
                                "mr-2",
                                "cursor-pointer duration-150",
                                "hover:scale-110",
                                "active:!scale-90"
                            )}
                        >
                            {selected.find((s) => s.trackId === t.trackId) ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            ) : (
                                <PlusCircleIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
