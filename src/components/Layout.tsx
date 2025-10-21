"use client";
import React from "react";
import useWindowMetrics from "@/hook/useWindowMetrics";

import { Toaster } from "sonner";
import { MenuBar } from "@/components/MenuBar";

import Script from "next/script";
import { cn } from "@/lib/cn";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const metrics = useWindowMetrics();

    return (
        <main
            className={cn(
                "w-full flex flex-col items-center overflow-y-scroll",
                "selection:bg-green-400 selection:text-background"
            )}
            style={{
                maxHeight: `${metrics.innerHeight}px`,
            }}
        >
            <MenuBar />
            <Script
                id="spotify-sdk"
                src="https://sdk.scdn.co/spotify-player.js"
                strategy="afterInteractive"
            />
            {children}
            <footer
                className={cn(
                    "w-full",
                    "border-t border-neutral-700",
                    "bg-green-400 px-8 py-5",
                    "flex items-center justify-between text-xs text-background",
                    "selection:bg-background! selection:text-green-400!"
                )}
            >
                <span className="font-logo font-extrabold text-4xl">MuseCalendar</span>
                <span>
                    © {new Date().getFullYear()} MuseCalendar · made for interactive music streams
                </span>
            </footer>
            <Toaster richColors position="top-center" />
        </main>
    );
}
