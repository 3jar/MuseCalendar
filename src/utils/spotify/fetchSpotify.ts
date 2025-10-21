// src/utils/fetchSpotify.ts
import "server-only";
import { readSession } from "@/lib/session";
import { getSpotifyAppToken, getSpotifyToken } from "./getSpotifyToken";

export default async function fetchSpotify(endpoint: string, options: RequestInit = {}) {
    // 세션 읽기
    const session = (await readSession()) as {
        spotify?: { hasSpotify?: boolean; tokenKey: string };
    } | null;

    const accessToken = session?.spotify?.hasSpotify
        ? await getSpotifyToken(session.spotify.tokenKey)
        : await getSpotifyAppToken();

    const clean = endpoint.replace(/^\/+/, "");

    // 헤더 병합: 항상 Authorization이 마지막에 오게 해서 덮어쓰지 못하게 함
    const userHeaders = new Headers(options.headers as HeadersInit | undefined);
    const headers = new Headers({
        "Content-Type": "application/json",
    });
    // 사용자가 보낸 헤더 먼저 합치고
    userHeaders.forEach((v, k) => headers.set(k, v));
    // 우리가 필요한 권한 헤더는 마지막에 강제 셋
    headers.set("Authorization", `Bearer ${accessToken}`);

    const res = await fetch(`https://api.spotify.com/v1/${clean}`, {
        ...options,
        headers,
        cache: "no-store",
    });

    if (res.status === 204) {
        // No Content → 안전하게 null 반환
        return null;
    }

    if (!res.ok) {
        // 에러 바디가 없을 수도 있으니 방어
        const text = await res.text().catch(() => "");
        let reason = res.statusText;
        try {
            const err = text ? JSON.parse(text) : {};
            reason = err?.error?.message || err?.message || reason;
        } catch {
            /* noop */
        }
        throw new Error(`Spotify API error ${res.status}: ${reason}`);
    }

    // JSON 응답
    return res.json();
}
