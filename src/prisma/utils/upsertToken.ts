import crypto from "node:crypto";
import prisma from "@/prisma/client";
import { Prisma, TokenProvider } from "@prisma/client";

type UpsertParams = {
    provider: TokenProvider;
    subject: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number | Date;
    refreshTokenExpires?: number | Date;
    scope?: string;
    meta?: Prisma.InputJsonValue; // 👈 any 대신
};

const toDate = (v?: number | Date) => (v == null ? undefined : v instanceof Date ? v : new Date(v));

function makeSessionKey() {
    return crypto.randomBytes(32).toString("base64url");
}

export default async function upsertTokenRecord({
    provider,
    subject,
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
    scope,
    meta,
}: UpsertParams): Promise<{ tokenId: string; sessionKey: string | null }> {
    // SPOTIFY_APP은 sessionKey 미발급
    const needSessionKey = provider !== TokenProvider.SPOTIFY_APP;

    // 현재 레코드 유무 확인(세션키 반환 용)
    const existing = await prisma.token.findUnique({
        where: { provider_subject: { provider, subject } },
        select: { id: true, sessionKey: true },
    });

    // upsert 준비
    const updateData: Prisma.TokenUpdateInput = {
        // 전달된 값만 업데이트 (undefined면 필드 유지)
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
        accessTokenExpires: toDate(accessTokenExpires),
        refreshTokenExpires: toDate(refreshTokenExpires),
        scope: scope ?? undefined,
        meta: meta ?? undefined,
    };

    // 생성 데이터
    const sessionKey: string | null = existing?.sessionKey ?? null;

    const createData: Prisma.TokenCreateInput = {
        provider,
        subject,
        sessionKey: needSessionKey ? (sessionKey ?? makeSessionKey()) : null,
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
        accessTokenExpires: toDate(accessTokenExpires),
        refreshTokenExpires: toDate(refreshTokenExpires),
        scope: scope ?? undefined,
        meta: meta ?? undefined,
    };

    try {
        const saved = await prisma.token.upsert({
            where: { provider_subject: { provider, subject } },
            update: updateData,
            create: createData,
            select: { id: true, sessionKey: true },
        });

        // 만약 sessionKey 유니크 충돌이 우려되면 위 upsert를 try/catch로 감싸고
        // P2002 유니크 에러일 때 sessionKey 재발급 후 1회 재시도하는 패턴도 가능

        return { tokenId: saved.id, sessionKey: saved.sessionKey };
    } catch (e: any) {
        // 유니크 충돌 등 예외 처리(필요시 재시도)
        if (e?.code === "P2002" && e?.meta?.target?.includes("provider_sessionKey")) {
            // 세션키 충돌 → 1회 재시도
            if (needSessionKey) {
                const retryKey = makeSessionKey();
                const retry = await prisma.token.upsert({
                    where: { provider_subject: { provider, subject } },
                    update: updateData,
                    create: { ...createData, sessionKey: retryKey },
                    select: { id: true, sessionKey: true },
                });
                return { tokenId: retry.id, sessionKey: retry.sessionKey };
            }
        }
        throw e;
    }
}
