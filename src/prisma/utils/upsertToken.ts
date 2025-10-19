import crypto from "node:crypto";
import prisma from "@/prisma/client";
import { TokenProvider } from "@prisma/client";

export default async function upsertTokenRecord(params: {
    provider: TokenProvider;
    subject: string;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    accessTokenExpires?: number | Date | undefined; // ms epoch or Date
    refreshTokenExpires?: number | Date | undefined; // ms epoch or Date
    scope?: string | undefined;
    meta?: Record<string, unknown> | undefined;
}): Promise<{ tokenId: string; sessionKey: string | null }> {
    const {
        provider,
        subject,
        accessToken = null,
        refreshToken = null,
        accessTokenExpires = null,
        refreshTokenExpires = null,
        scope = null,
        meta = null,
    } = params;

    let sessionKey: string | null;
    if (provider != "SPOTIFY_APP") {
        while (true) {
            const temp_sessionKey = crypto.randomBytes(32).toString("base64url");
            const conflict = await prisma.token.findFirst({
                where: { provider, sessionKey: temp_sessionKey },
                select: { id: true },
            });
            if (!conflict) {
                sessionKey = temp_sessionKey;
                break;
            }
        }
    } else {
        sessionKey = null;
    }

    // Normalise dates
    const toDate = (v: number | Date | null | undefined) =>
        v == null ? null : v instanceof Date ? v : new Date(v);

    const existing = await prisma.token.findFirst({
        where: { provider, subject },
        select: { id: true },
    });

    if (existing) {
        const updated = await prisma.token.update({
            where: { id: existing.id },
            data: {
                sessionKey,
                accessToken,
                refreshToken,
                accessTokenExpires: toDate(accessTokenExpires),
                refreshTokenExpires: toDate(refreshTokenExpires),
                scope: scope ?? undefined,
                meta: meta as any,
            },
            select: { id: true },
        });
        return { tokenId: updated.id, sessionKey };
    }

    const created = await prisma.token.create({
        data: {
            provider,
            subject,
            sessionKey,
            accessToken,
            refreshToken,
            accessTokenExpires: toDate(accessTokenExpires),
            refreshTokenExpires: toDate(refreshTokenExpires),
            scope: scope ?? undefined,
            meta: meta as any,
        },
        select: { id: true },
    });

    return { tokenId: created.id, sessionKey };
}
