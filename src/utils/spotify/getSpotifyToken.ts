import getToken from "@/prisma/utils/getToken"; // 진짜 경로/함수명 확인
import upsertTokenRecord from "@/prisma/utils/upsertToken";

const SKEW_MS = 60_000;

async function fetchAppAccessToken(): Promise<{ accessToken: string; expiresAt: number }> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("Missing SPOTIFY_CLIENT_ID/SECRET");

    // Node 런타임 가정
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const r = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
        cache: "no-store",
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.access_token) {
        console.error("Spotify app token error:", r.status, j);
        throw new Error("SPOTIFY_APP_TOKEN_ERROR");
    }

    return {
        accessToken: j.access_token as string,
        expiresAt: Date.now() + (j.expires_in ?? 3600) * 1000,
    };
}

export async function getSpotifyAppToken(): Promise<string> {
    const row = await getToken("SPOTIFY_APP", "", [
        "id",
        "accessToken",
        "accessTokenExpires",
    ] as const);

    const now = new Date();

    if (!row || row.accessTokenExpires.getTime() - now.getTime() <= SKEW_MS) {
        const fresh = await fetchAppAccessToken();
        await upsertTokenRecord({
            provider: "SPOTIFY_APP",
            subject: "app",
            accessToken: fresh.accessToken,
            accessTokenExpires: new Date(fresh.expiresAt),
        });
        return fresh.accessToken;
    }

    return row.accessToken as string;
}

async function refreshAccessToken(
    refreshToken: string
): Promise<{ accessToken: string; expiresAt: number }> {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID!,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: refreshToken!,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            accessToken: refreshedTokens.access_token,
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
        };
    } catch (error) {
        console.error("Error refreshing Spotify access token:", error);
        throw new Error("SPOTIFY_TOKEN_ERROR");
    }
}

export async function getSpotifyToken(tokenKey: string): Promise<string> {
    const row = await getToken("SPOTIFY", tokenKey, [
        "subject",
        "accessToken",
        "accessTokenExpires",
        "refreshToken",
    ] as const);

    const now = new Date();

    if (!row || row.accessTokenExpires.getTime() - now.getTime() <= SKEW_MS) {
        const fresh = await refreshAccessToken(row!.refreshToken);
        await upsertTokenRecord({
            provider: "SPOTIFY",
            subject: row!.subject,
            accessToken: fresh.accessToken,
            accessTokenExpires: new Date(fresh.expiresAt),
        });
        return fresh.accessToken;
    }

    return row.accessToken as string;
}
