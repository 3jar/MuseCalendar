"use client";
import { useRouter, usePathname } from "next/navigation";
import { SignInComp } from "./signin";
import { MusicalNoteIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export default function MenuBar() {
    const router = useRouter();
    const pathname = usePathname();

    const [clear, setClear] = useState(false);

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
                    className="font-bold text-green-500 text-2xl cursor-pointer"
                    style={{ fontFamily: "var(--font-archivo-black)" }}
                    onClick={() => router.push("/")}
                >
                    MuseCalendar
                </button>
                <div className="flex gap-[30px]">
                    <button
                        className="font-extrabold text-sm hover:text-green-500 duration-100 cursor-pointer"
                        onClick={() => router.push("/")}
                    >
                        Home
                    </button>
                    <button
                        className="font-extrabold text-sm hover:text-green-500 duration-100 cursor-pointer"
                        onClick={() => router.push("/calendar")}
                    >
                        Calendar
                    </button>
                    <button
                        className="font-extrabold text-sm hover:text-green-500 duration-100 cursor-pointer"
                        onClick={() => router.push("/play")}
                    >
                        Play
                    </button>
                </div>
            </div>
            <div className="flex justify-center gap-[5px]">
                <button
                    className="text-sm font-extrabold flex items-center gap-[10px] cursor-pointer hover:text-green-500 duration-150"
                    onClick={() => router.push("/search")}
                >
                    <MusicalNoteIcon className="w-4 h-4" />
                    Music Search
                </button>
                <SignInComp />
            </div>
        </div>
    );
}
