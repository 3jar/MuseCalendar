import { SignJWT, jwtVerify } from "jose";
import { AppSession } from "@/types/auth";
import { cookies } from "next/headers";
import { TokenProvider } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);
const DEFAULT_MAX_AGE_SEC = Number(process.env.APP_SESSION_MAX_AGE_DAYS ?? 30) * 24 * 60 * 60;

function normalizeSessionPayload(p: any): AppSession | null {
    if (!p) return null;
    const u = p.user ?? {};
    const user = {
        id: u.id != null ? String(u.id) : "",
        name: u.name ?? "",
        displayId: u.displayId != null ? String(u.displayId) : "",
        roles: Array.isArray(u.roles) ? (u.roles as any[]).map(String) : [],
        exp: u.exp != null ? Number(u.exp) : 0,
        tokenKey: u.tokenKey != null ? String(u.tokenKey) : "",
        grade: u.grade != null ? Number(u.grade) : 0,
        class: u.class != null ? Number(u.class) : 0,
        number: u.number != null ? Number(u.number) : 0,
        generation: u.generation != null ? Number(u.generation) : 0,
    };

    let spotify: AppSession["spotify"] | undefined;
    if (p.spotify) {
        const s = p.spotify ?? {};
        spotify = {
            hasSpotify: !!s.hasSpotify,
            userId: s.userId != null ? String(s.userId) : "",
            username: s.username != null ? String(s.username) : "",
            image: s.image != null ? String(s.image) : "",
            exp: s.exp != null ? Number(s.exp > 1e12 ? Math.floor(s.exp / 1000) : s.exp) : 0,
            tokenKey: s.tokenKey != null ? String(s.tokenKey) : "",
            explicit_content: s.explicit_content
                ? {
                      filter_enabled: !!s.explicit_content.filter_enabled,
                      filter_locked: !!s.explicit_content.filter_locked,
                  }
                : undefined,
            product: s.product != null ? String(s.product) : "",
            type: s.type != null ? String(s.type) : "",
        };
    }

    return { user, ...(spotify ? { spotify } : {}) };
}

// --- Session cookie helpers (server) ---
const APP_SESSION_COOKIE = "app_session" as const;

/** Set the app session cookie (opaque or JWT value). */
export async function setSession(value: AppSession, maxAgeSec: number = DEFAULT_MAX_AGE_SEC) {
    const jar = await cookies();
    const payload: any = { user: value.user };
    if (value.spotify) payload.spotify = value.spotify;

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSec)
        .sign(secret);

    jar.set(APP_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAgeSec,
    });
}

/** Read the app session cookie value. */
export async function readSession(): Promise<AppSession | null> {
    const jar = await cookies();
    const token = jar.get(APP_SESSION_COOKIE)?.value;
    if (!token) return null;
    const res = await jwtVerify(token, secret).catch(() => null as any);
    if (!res?.payload) return null;
    return normalizeSessionPayload(res.payload);
}

/** Delete the app session cookie. */
export async function deleteSession(provider: TokenProvider) {
    const jar = await cookies();
    const token = jar.get(APP_SESSION_COOKIE)?.value;

    if (!token) return;

    const verified = await jwtVerify(token, secret).catch(() => null as any);
    if (!verified?.payload) {
        jar.delete(APP_SESSION_COOKIE);
        return;
    }

    const prev = normalizeSessionPayload(verified.payload);
    if (!prev) {
        jar.delete(APP_SESSION_COOKIE);
        return;
    }

    if (provider === TokenProvider.SSO) {
        jar.delete(APP_SESSION_COOKIE);
        return;
    }

    const hasSpotify = !!prev.spotify && Object.keys(prev.spotify).length > 0;
    if (!hasSpotify) {
        return;
    }

    const next: AppSession = { ...prev, spotify: undefined };

    // 기존 토큰 남은 수명 유지
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec =
        typeof verified.payload.exp === "number"
            ? verified.payload.exp
            : nowSec + DEFAULT_MAX_AGE_SEC;
    const remainingSec = Math.max(0, expSec - nowSec);

    // 남은 수명이 0이면 삭제(만료) 처리
    if (remainingSec === 0) {
        jar.delete(APP_SESSION_COOKIE);
        return;
    }

    await setSession(next, remainingSec);
}

export function cookieHeader(name: string, value: string, maxAgeSec: number) {
    const base = `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return base + secure;
}

export function deleteCookieHeader(name: string) {
    const base = `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return base + secure;
}
