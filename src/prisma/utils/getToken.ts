import prisma from "../client";
import { Prisma, TokenProvider } from "@prisma/client";

function normalizeProvider(provider: TokenProvider | string): TokenProvider {
    const p = String(provider).toUpperCase();
    if (p === "SSO" || p === "SPOTIFY" || p === "SPOTIFY_APP") return p as TokenProvider;
    throw new Error(`Unknown provider: ${provider}`);
}

export type TokenSelectableKey =
    | "id"
    | "provider"
    | "subject"
    | "sessionKey"
    | "accessToken"
    | "refreshToken"
    | "accessTokenExpires"
    | "refreshTokenExpires"
    | "scope"
    | "meta"
    | "createdAt"
    | "updatedAt";

export type TokenScope = TokenSelectableKey[];

export default async function getToken(
    provider: TokenProvider | string,
    sessionKey?: string | null,
    scope?: TokenScope
): Promise<null | Record<string, any>> {
    const prov = normalizeProvider(provider);

    const where: Prisma.TokenWhereInput = {
        provider: prov,
        ...(sessionKey ? { sessionKey } : {}),
    };

    const row = await prisma.token.findFirst({
        where,
        orderBy: { updatedAt: "desc" },
    });

    if (!row) return null;

    if (!scope || scope.length === 0) {
        return row as unknown as Record<string, any>;
    }

    const out: Record<string, any> = {};
    for (const key of scope) {
        out[key] = (row as any)[key];
    }
    return out;
}
