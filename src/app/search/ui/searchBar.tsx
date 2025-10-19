"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { UseLoaderReturn } from "@/hook/useLoader";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface SearchBarProps {
    searchLoader: UseLoaderReturn;
    setQ: (arg: string) => void;
}

export default function SearchBar({ searchLoader, setQ }: SearchBarProps) {
    const [tempQ, setTempQ] = useState<string>("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setQ(tempQ);
    }

    return (
        <form onSubmit={onSubmit} className="flex gap-[10px] mb-[25px]">
            <div
                className={cn(
                    "flex items-center w-full px-3 py-2",
                    "rounded bg-background border border-neutral-700",
                    "duration-50",
                    "focus-within:border-neutral-400"
                )}
            >
                {searchLoader.state == "loading" ? (
                    <>{searchLoader.Icon}</>
                ) : (
                    <MagnifyingGlassIcon className="h-5 w-5" />
                )}
                <input
                    value={tempQ}
                    onChange={(e) => setTempQ(e.target.value)}
                    placeholder="곡명, 아티스트, 앨범..."
                    className="w-full focus:outline-none ml-2"
                />
                <button
                    type="button"
                    className={cn(
                        "cursor-pointer duration-150",
                        "hover:scale-105",
                        "active:!scale-95"
                    )}
                    onClick={() => setTempQ("")}
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            <button
                className={cn(
                    "flex justify-center items-center h-auto px-3",
                    "rounded border border-neutral-700 bg-neutral-900",
                    "cursor-pointer",
                    "active:!scale-95 duration-150"
                )}
                type="submit"
            >
                Search
            </button>
        </form>
    );
}
