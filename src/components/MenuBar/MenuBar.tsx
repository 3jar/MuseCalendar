"use client";
import { useRouter, usePathname } from "next/navigation";
import { SignInComp } from "./signin";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export default function MenuBar() {
    const router = useRouter();
    const pathname = usePathname();

    const [clear, setClear] = useState(false);

    const [q, setQ] = useState<string>("");

    useEffect(() => {
        setClear(false);
        if (pathname == "/") setClear(true);
    }, [pathname]);

    function beClear() {
        if (pathname == "/play") {
            setClear((prev) => {
                return !prev;
            });
        }
    }

    return (
        <div
            className={cn(
                "fixed w-full bg-neutral-900 border-b border-neutral-700 px-7 py-3 flex justify-between items-center z-50 top-0 duration-150",
                clear && "!bg-transparent !border-none"
            )}
            onClick={() => beClear()}
        >
            <div className="flex items-center gap-[50px]">
                <button
                    className="font-bold text-green-400 text-2xl cursor-pointer font-logo"
                    onClick={() => router.push("/")}
                >
                    MuseCalendar
                </button>
                <div className="flex gap-[30px]">
                    <button
                        className="font-extrabold text-sm hover:text-green-400 duration-100 cursor-pointer"
                        onClick={() => router.push("/")}
                    >
                        Home
                    </button>
                    <button
                        className="font-extrabold text-sm hover:text-green-400 duration-100 cursor-pointer"
                        onClick={() => router.push("/calendar")}
                    >
                        Calendar
                    </button>
                    <a
                        className="font-extrabold text-sm hover:text-green-400 duration-100 cursor-pointer"
                        href="/play"
                    >
                        Play
                    </a>
                </div>
            </div>
            <div className="flex justify-center gap-[5px]">
                <form
                    className="flex justify-center bg-black border border-neutral-700 rounded px-2 my-1 gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.push(`/search?q=${q}`);
                    }}
                >
                    <div className="flex items-center">
                        <Search className="h-4 w-4" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="곡명, 아티스트, 앨범..."
                            className="w-full focus:outline-none ml-2 text-xs"
                        />
                    </div>
                    <div className="w-[1] h-full bg-neutral-700" />
                    <button className="text-xs h-full justify-center font-bold flex items-center gap-[10px] cursor-pointer hover:text-green-400 duration-150">
                        Music Search
                    </button>
                </form>
                <SignInComp />
            </div>
        </div>
    );
}
