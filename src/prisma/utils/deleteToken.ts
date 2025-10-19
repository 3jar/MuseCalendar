import prisma from "../client";
import { TokenProvider } from "@prisma/client";

function normalizeProvider(provider: TokenProvider | string): TokenProvider {
    const p = String(provider).toUpperCase();
    if (p === "SSO" || p === "SPOTIFY" || p === "SPOTIFY_APP") return p as TokenProvider;
    throw new Error(`Unknown provider: ${provider}`);
}

export default async function deleteToken(prov: TokenProvider, sessionKey: string) {
    try {
        const provider = normalizeProvider(prov);

        // 삭제 실행
        await prisma.token.delete({
            where: { provider, sessionKey },
        });

        return { success: true };
    } catch (error) {
        return { success: false, message: (error as any).message };
    }
}
