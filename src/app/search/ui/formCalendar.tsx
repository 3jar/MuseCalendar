"use client";
import { SongForm } from "@prisma/client";
import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import type * as uiTypes from "./index";

import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

export type ExsistingDate = {
    songform: SongForm;
    streamDate: Date;
    userId: string;
};

type dates = {
    date: Date;
    form: SongForm;
    disabled?: boolean;
    submit: boolean;
    outOfMonth?: boolean;
};

interface FormCalendarProps {
    songform: SongForm;
    setDate: (date: Date | null) => void;
    exdate: ExsistingDate[];
}

function generateMonthDates(monthOffset: number, next: boolean) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekday = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    const endWeekday = lastDay.getDay();

    const prevMonthLastDay = new Date(year, month, 0); // prev month last date
    const nextMonthFirstDay = new Date(year, month + 1, 1);

    const leadCount = startWeekday; // how many days to show from previous month
    const tailCount = 6 - endWeekday; // how many days to show from next month

    const dates: dates[] = [];

    for (let i = leadCount; i > 0; i--) {
        const d = new Date(
            prevMonthLastDay.getFullYear(),
            prevMonthLastDay.getMonth(),
            prevMonthLastDay.getDate() - (i - 1)
        );
        dates.push({
            date: d,
            form: "WAKEUP",
            submit: false,
            disabled: true,
            outOfMonth: true,
        });
    }
    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const disabled = now.getDate() > d && !next;
        dates.push({
            date,
            form: "WAKEUP",
            submit: false,
            disabled,
            outOfMonth: false,
        });
    }
    for (let i = 1; i <= tailCount; i++) {
        const d = new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth(), i);
        dates.push({
            date: d,
            form: "WAKEUP",
            submit: false,
            disabled: true,
            outOfMonth: true,
        });
    }

    for (let i = leadCount; i > 0; i--) {
        const d = new Date(
            prevMonthLastDay.getFullYear(),
            prevMonthLastDay.getMonth(),
            prevMonthLastDay.getDate() - (i - 1)
        );
        dates.push({
            date: d,
            form: "LABOR",
            submit: false,
            disabled: true,
            outOfMonth: true,
        });
    }

    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
        const current = new Date(year, month, d);
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;
        const isPast = now.getDate() > d && !next;
        const disabled = isWeekend || isPast;
        dates.push({
            date: current,
            form: "LABOR",
            submit: false,
            disabled,
            outOfMonth: false,
        });
    }
    // Trailing (next month) — always disabled
    for (let i = 1; i <= tailCount; i++) {
        const d = new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth(), i);
        dates.push({
            date: d,
            form: "LABOR",
            submit: false,
            disabled: true,
            outOfMonth: true,
        });
    }

    return dates;
}

export function FormCalendar({ exdate, songform, setDate }: FormCalendarProps) {
    const [dates, setDates] = useState<{ c: dates[]; n: dates[] }>({ c: [], n: [] });
    const [clickedDate, setClickedDate] = useState<Date | null>();
    const [curruntCal, setCurruntCal] = useState<{ m: boolean; s: SongForm }>({
        m: false,
        s: songform,
    });
    const [curMonth, setCurMonth] = useState<string>("");
    const [collapsed, setCollapsed] = useState(false);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const now = useMemo(() => new Date(), []);
    const [nextApply, setNextApply] = useState<boolean>(true);

    useEffect(() => {
        if (now.getDate() > 24) {
            setNextApply(false);
        }
    }, [now]);

    useEffect(() => {
        const month = new Date(
            now.getFullYear(),
            now.getMonth() + (curruntCal.m ? 1 : 0),
            1
        ).toLocaleString("en-US", { month: "short" });
        setCurMonth(month);
    }, [curruntCal.m, now]);

    useEffect(() => {
        const measure = () => {
            if (contentRef.current) {
                setMaxHeight(contentRef.current.scrollHeight);
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [curruntCal.m, dates]);

    useEffect(() => {
        const c = generateMonthDates(0, false).map((dateEntry) => {
            if (dateEntry.outOfMonth) return dateEntry;
            const matched = exdate.find(
                (e) =>
                    new Date(e.streamDate).toDateString() === dateEntry.date.toDateString() &&
                    e.songform === dateEntry.form
            );
            return matched ? { ...dateEntry, submit: true } : dateEntry;
        });
        const n = generateMonthDates(1, true).map((dateEntry) => {
            if (dateEntry.outOfMonth) return dateEntry;
            const matched = exdate.find(
                (e) =>
                    new Date(e.streamDate).toDateString() === dateEntry.date.toDateString() &&
                    e.songform === dateEntry.form
            );
            return matched ? { ...dateEntry, submit: true } : dateEntry;
        });
        setDates({ c, n });
    }, [exdate]);

    useEffect(() => {
        setCurruntCal((prev) => ({
            m: prev.m,
            s: songform,
        }));
        setClickedDate(null);
    }, [songform]);

    function dateClick(date: Date) {
        if (date.getTime() === (clickedDate?.getTime?.() ?? -1)) {
            setClickedDate(null);
            setDate(null);
            setCollapsed(false);
            return;
        }
        setClickedDate(date);
        setDate(date);
        setCollapsed(true);
    }

    return (
        <div className="max-w-[420px] bg-neutral-900 border border-neutral-700 rounded p-5 flex flex-col justify-center">
            {/* Compact indicator bar (visible when collapsed) */}
            <div
                className={cn(
                    "flex items-center justify-between gap-3",
                    "transition-opacity duration-200"
                )}
            >
                <div className="min-h-[40px] flex items-center">
                    <span className="font-bold">
                        {clickedDate
                            ? `${clickedDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                              })} · ${curruntCal.s === "WAKEUP" ? "기상송" : "노동요"}`
                            : "날짜를 선택하세요"}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "rounded-md px-2 py-1 rotate-180 duration-200 ease-in-out",
                        collapsed && "rotate-0"
                    )}
                    aria-label="달력 펼치기"
                >
                    <ChevronDownIcon className="w-6 h-6 cursor-pointer" />
                </button>
            </div>

            {/* Collapsible calendar content */}
            <div
                className={cn("overflow-hidden transition-[max-height] duration-300 ease-in-out")}
                style={{ maxHeight: collapsed ? 0 : Math.max(maxHeight, 56) }}
            >
                <div ref={contentRef}>
                    <div className="flex justify-between items-center mb-5">
                        <ChevronLeftIcon
                            className={cn(
                                "w-8 h-8 p-1 rounded-lg",
                                curruntCal.m
                                    ? "hover:bg-neutral-700 cursor-pointer duration-150"
                                    : "text-gray-400 cursor-default"
                            )}
                            onClick={() =>
                                curruntCal.m && setCurruntCal({ ...curruntCal, m: false })
                            }
                            aria-disabled={!curruntCal.m}
                        />
                        <span className="text-2xl font-bold">{curMonth}</span>
                        <ChevronRightIcon
                            className={cn(
                                "w-8 h-8 p-1 rounded-lg",
                                !curruntCal.m
                                    ? "hover:bg-neutral-700 cursor-pointer duration-150"
                                    : "text-gray-400 cursor-default"
                            )}
                            onClick={() =>
                                !curruntCal.m && setCurruntCal({ ...curruntCal, m: true })
                            }
                            aria-disabled={curruntCal.m}
                        />
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        <span className="w-full flex justify-center">S</span>
                        <span className="w-full flex justify-center">M</span>
                        <span className="w-full flex justify-center">T</span>
                        <span className="w-full flex justify-center">W</span>
                        <span className="w-full flex justify-center">T</span>
                        <span className="w-full flex justify-center">F</span>
                        <span className="w-full flex justify-center">S</span>

                        {(curruntCal.m ? dates.n : dates.c).map((date, index) =>
                            curruntCal.s == date.form ? (
                                <button
                                    key={index}
                                    disabled={date.submit || (nextApply && curruntCal.m)}
                                    className={cn(
                                        "aspect-square rounded flex flex-col justify-center items-center duration-150",
                                        date.disabled
                                            ? "opacity-40 cursor-default"
                                            : "cursor-pointer",
                                        !date.disabled &&
                                            !date.submit &&
                                            clickedDate?.getTime?.() !== date.date.getTime() &&
                                            "hover:bg-neutral-700",
                                        !date.disabled &&
                                            clickedDate?.getTime?.() === date.date.getTime() &&
                                            "bg-green-400"
                                    )}
                                    onClick={
                                        !date.disabled ? () => dateClick(date.date) : undefined
                                    }
                                >
                                    <span className="font-semibold">{date.date.getDate()}</span>
                                    <div
                                        className={cn(
                                            "w-1 h-1 rounded-full bg-red-500 hidden",
                                            date.submit && "block"
                                        )}
                                    />
                                </button>
                            ) : undefined
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
