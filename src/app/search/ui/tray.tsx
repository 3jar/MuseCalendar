"use client";
import Image from "next/image";
import { TrackItem } from "@/types/musicTypes";
import { cn } from "@/lib/cn";
import { TrashIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface TrayProps {
    selected: TrackItem[];
    removeFromTray: (arg: string) => void;
}

const list = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }, // 자식 간 순차 간격
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
} satisfies Variants;

export default function Tray({ selected, removeFromTray }: TrayProps) {
    return (
        <motion.ul
            className="space-y-2"
            variants={list}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            <AnimatePresence>
                {selected.map((s) => (
                    <motion.li
                        key={s.trackId}
                        variants={item}
                        layout="position"
                        exit="exit"
                        className="bg-background flex items-center gap-3 p-2 rounded border border-neutral-700 hover:bg-neutral-900 duration-150"
                    >
                        {s.imageUrl && (
                            <Image
                                width={40}
                                height={40}
                                src={s.imageUrl}
                                alt=""
                                className="rounded"
                            />
                        )}
                        <div className="flex-1">
                            <div className="text-sm font-bold">{s.name}</div>
                            <div className="text-xs text-neutral-400">{s.artists.join(", ")}</div>
                        </div>
                        <button
                            onClick={() => removeFromTray(s.trackId)}
                            className={cn(
                                "cursor-pointer duration-150 pr-2",
                                "hover:scale-110",
                                "active:!scale-90"
                            )}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </motion.li>
                ))}
            </AnimatePresence>
        </motion.ul>
    );
}
