"use client";
import { useEffect, useState } from "react";
import useWindowMetrics from "@/hook/useWindowMetrics";

export default function Page() {
    const metrics = useWindowMetrics();
    function useIsClient() {
        const [isClient, setIsClient] = useState(false);
        useEffect(() => setIsClient(true), []);
        return isClient;
    }

    // 컴포넌트 안
    const isClient = useIsClient();

    return (
        <main
            className="relative overflow-hidden min-h-screen flex justify-center items-center pt-[72px]"
            style={isClient ? { height: `${metrics.innerHeight}px` } : undefined}
        >
            <div className="grid grid-cols-3 gap-1 p-3 w-full h-full">
                <div className="bg-black w-full h-full rounded-lg col-span-2"></div>
                <div className="relative bg-backgorund w-full h-full rounded-lg col-span-1 overflow-hidden flex justify-center items-center">
                    <div className="shadow-2xl shadow-green-500 px-5 py-3 text-xl font-bold rounded">
                        날짜를 클릭해 플레이리스트를 확인하세요
                    </div>
                </div>
            </div>
        </main>
    );
}
