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
        <ul className="mt-4 space-y-3 rounded">
            {items.map((t) => (
                <li
                    key={t.trackId}
                    className={cn(
                        "flex items-center bg-background gap-3 p-2 rounded duration-100 border border-neutral-700 cursor-pointer hover:border-foreground/50",
                        selected.find((s) => s.trackId === t.trackId) &&
                            "bg-neutral-900 border-green-900"
                    )}
                >
                    {t.imageUrl && (
                        <Image src={t.imageUrl} alt="" width={48} height={48} className="rounded" />
                    )}
                    <div className="flex-1">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-neutral-400">
                            {t.artists.join(", ")} · {t.album} · {msToMMSS(t.durationMs)}
                        </div>
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
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                            <PlusCircleIcon className="h-5 w-5" />
                        )}
                    </button>
                </li>
            ))}
        </ul>
    );
}
