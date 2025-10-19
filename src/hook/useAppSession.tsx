// src/hook/useAppSession.tsx
"use client";
import useSWR from "swr";
import type { AppSession } from "@/types/auth";
import { useRouter } from "next/navigation";

type SessionResponse = AppSession;

const fetcher = (url: string) =>
    fetch(url, { credentials: "include", cache: "no-store" }).then(
        (r) => r.json() as Promise<SessionResponse>
    );

export function useAppSession() {
    const router = useRouter();

    const { data, error, isLoading, mutate } = useSWR<SessionResponse>(
        "/api/auth/session",
        fetcher,
        {
            revalidateOnMount: true,
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: () => (document.visibilityState === "visible" ? 5 * 60_000 : 0), // 5분
            dedupingInterval: 2000,
        }
    );

    const session = data ?? null;
    const status: "authenticated" | "unauthenticated" | "loading" = isLoading
        ? "loading"
        : !session || session.user || session?.spotify
          ? "authenticated"
          : "unauthenticated";

    const refresh = () => mutate(undefined, { revalidate: true });

    async function signOut(provider: string) {
        await fetch(`/api/auth/session/logout/${provider}`);
        await mutate();
        router.push("/");
    }

    return { session, status, error, signOut, refresh };
}
