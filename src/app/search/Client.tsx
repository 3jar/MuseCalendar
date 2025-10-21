"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrackItem } from "@/types/musicTypes";
import { InboxIcon, MusicalNoteIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";
import useLoader from "@/hook/useLoader";
import { toast } from "sonner";
import useWindowMetrics from "@/hook/useWindowMetrics";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useAppSession } from "@/hook/useAppSession";

import * as ui from "./ui";
import type * as uiTypes from "./ui";

function msToMMSS(ms: number) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

type body = {
    trackId: string;
    orderIndex: number;
};

export default function Client() {
    const [items, setItems] = useState<TrackItem[]>([]);

    const router = useRouter();
    const [streamDate, setStreamDate] = useState<Date | null>();

    const searchLoader = useLoader();
    const saveLoader = useLoader();

    const debounced = useMemo(() => {
        let timer: any;
        return (val: string, cb: (v: string) => void) => {
            clearTimeout(timer);
            timer = setTimeout(() => cb(val), 300);
        };
    }, []);

    const searchQ = useSearchParams().get("q")?.toString() ?? "";
    const [q, setQ] = useState(searchQ);

    const metrics = useWindowMetrics();
    const { session } = useAppSession();

    useEffect(() => {
        searchLoader.reset();
        if (!q.trim()) {
            setItems([]);
            searchLoader.message("");
            return;
        }
        debounced(q, async (val) => {
            try {
                searchLoader.start();
                const res = await fetch(
                    `/api/music/search?q=${encodeURIComponent(val)}&limit=20&market=KR`
                );
                if (!res.ok) throw new Error(`Search failed: ${res.status}`);
                const data = await res.json();
                setItems(data.items ?? []);
                searchLoader.succeed();
            } catch (e: any) {
                searchLoader.message(e.message ?? "Search error");
                searchLoader.fail();
                setItems([]);
            }
        });
    }, [q, debounced]);

    const [selected, setSelected] = useState<TrackItem[]>([]);

    function addToTray(item: TrackItem) {
        if (selected.find((s) => s.trackId === item.trackId)) return;
        setSelected((prev) => [...prev, item]);
    }
    function removeFromTray(id: string) {
        setSelected((prev) => prev.filter((s) => s.trackId !== id));
    }

    async function createAndSavePlaylist() {
        const canSubmit = exdate.find((e) => {
            if (session?.user.id === e.userId) {
                return true;
            } else {
                return false;
            }
        });
        if (canSubmit) {
            toast.warning("한 곡 씩만 신청할 수 있습니다.");
            return;
        }
        if (selected.length === 0) {
            toast.warning("선택한 곡이 없습니다. 검색해 신청하세요");
            return;
        }
        if (selected.length < 5) {
            toast.warning("5곡 이상 신청해주세요");
            return;
        } else if (selected.length > 5 && calendarType == "LABOR") {
            toast.warning("노동요는 5곡까지 신청할 수 있습니다.");
            return;
        }
        if (!streamDate) return toast.warning("날짜를 선택해주세요");
        try {
            saveLoader.start();
            const res = await fetch(`/api/music/playlists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ streamDate, songform: calendarType }),
            });
            if (!res.ok) throw new Error("플레이리스트 생성 실패");
            const data = await res.json();

            const body: body[] = selected.map((s, index) => ({
                trackId: s.trackId,
                orderIndex: index + 1,
            }));

            const results = await fetch(`/api/music/playlists/${data.pl.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!results.ok) throw new Error("일부 곡 저장 실패");

            setSelected([]);
            toast.success("플레이리스트가 생성되어 저장되었습니다.");
            router.push("/");
        } catch (e) {
            console.error(e);
            toast.error("저장 중 오류가 발생했습니다.");
        } finally {
            saveLoader.reset();
        }
    }

    const [calendarType, setCalendarType] = useState<"WAKEUP" | "LABOR">("WAKEUP");

    const [exdate, setExdate] = useState<uiTypes.ExsistingDate[]>([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await axios.get("/api/music/playlists");
                if (!r.data?.ok) throw new Error(`Failed to fetch playlists: ${r.status}`);
                if (alive) setExdate(r.data.playlists as uiTypes.ExsistingDate[]);
            } catch (err) {
                console.error(err);
                if (alive) setExdate([]);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <main className="w-full flex flex-col items-center mt-[68px]">
            <ui.Info />
            <ui.Divider />
            <section className="w-5/6 max-w-[1300px]">
                <div className="w-full grid grid-cols-3 gap-10 relative px-10 py-12">
                    <div className="w-full h-full col-span-2">
                        <h2 className="text-xl font-semibold mb-3">곡 검색</h2>
                        <ui.SearchBar searchLoader={searchLoader} setQ={setQ} q={q} />
                        {searchLoader.state == "success" ? (
                            <ui.SearchTrack
                                compHeight={metrics.innerHeight}
                                items={items}
                                selected={selected}
                                removeFromTray={removeFromTray}
                                addToTray={addToTray}
                                msToMMSS={msToMMSS}
                            />
                        ) : (
                            <div className="w-full flex-1 flex flex-col justify-center items-center">
                                {searchLoader.state == "error" ? (
                                    <>
                                        <ExclamationCircleIcon className="w-10 h-10 text-red-600 mb-2" />
                                        <div className="text-lg text-red-600">
                                            에러가 발생했습니다
                                        </div>
                                        <div className="text-xs text-red-600">
                                            {searchLoader.messages}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <MusicalNoteIcon className="w-10 h-10 text-neutral-400 mb-2" />
                                        <span className="text-lg text-neutral-400">
                                            검색하여 원하는 곡을 입력하세요
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="col-span-1 flex flex-col h-full">
                        <div className="mb-2 flex items-center justify-end">
                            <div className="inline-flex items-center rounded bg-background border border-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => setCalendarType("LABOR")}
                                    className={cn(
                                        "px-3 py-2 text-xs rounded-l transition-all duration-150 cursor-pointer",
                                        calendarType === "LABOR"
                                            ? "bg-foreground text-black"
                                            : "text-neutral-300 hover:text-white"
                                    )}
                                    aria-pressed={calendarType === "LABOR"}
                                >
                                    노동요
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarType("WAKEUP")}
                                    className={cn(
                                        "px-3 py-2 text-xs rounded-r transition-all duration-150 cursor-pointer",
                                        calendarType === "WAKEUP"
                                            ? "bg-foreground text-black"
                                            : "text-neutral-300 hover:text-white"
                                    )}
                                    aria-pressed={calendarType === "WAKEUP"}
                                >
                                    기상송
                                </button>
                            </div>
                        </div>

                        <ui.FormCalendar
                            exdate={exdate}
                            songform={calendarType}
                            setDate={setStreamDate}
                        />

                        <div className="flex items-center justify-between mb-3 mt-5">
                            <h3 className="text-lg font-semibold">담을 곡 트레이</h3>
                            <span className="text-sm">{selected.length}곡 선택</span>
                        </div>
                        <div className="flex flex-col mt-5">
                            {selected.length === 0 ? (
                                <div className="w-full flex-1 flex flex-col pb-10 pt-15 justify-center border border-neutral-700 bg-neutral-900 rounded items-center text-sm text-neutral-400">
                                    <InboxIcon className="w-7 h-7 mb-2" />
                                    트레이가 비었습니다. 곡을 검색해서 담아주세요.
                                </div>
                            ) : (
                                <>
                                    <div className="h-auto mb-4 flex">
                                        <button
                                            onClick={createAndSavePlaylist}
                                            disabled={saveLoader.state == "loading"}
                                            className={cn(
                                                "w-full cursor-pointer duration-150 flex justify-center",
                                                "active:!scale-95",
                                                "py-3 rounded bg-neutral-900 border border-neutral-700 text-green-400 font-bold cursor-pointer",
                                                "hover:bg-green-500 hover:text-background"
                                            )}
                                        >
                                            {saveLoader.state == "loading"
                                                ? saveLoader.Icon
                                                : "플레이리스트 생성 및 저장"}
                                        </button>
                                    </div>
                                    <ui.Tray selected={selected} removeFromTray={removeFromTray} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
