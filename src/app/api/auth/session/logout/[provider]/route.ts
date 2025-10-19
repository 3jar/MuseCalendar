import { NextResponse } from "next/server";
import { deleteSession, readSession } from "@/lib/session";
import { TokenProvider } from "@prisma/client";
import deleteToken from "@/prisma/utils/deleteToken";

function normalizeProvider(provider: TokenProvider | string): TokenProvider {
    const p = String(provider).toUpperCase();
    if (p === "SSO" || p === "SPOTIFY" || p === "SPOTIFY_APP") return p as TokenProvider;
    throw new Error(`Unknown provider: ${provider}`);
}

export async function GET(
    req: Request,
    { params: paramsPromise }: { params: Promise<{ provider: string }> }
) {
    const params = await paramsPromise;
    const provider = normalizeProvider(params.provider);
    const session = await readSession();
    const tokenKey =
        params.provider === "SSO" ? session?.user?.tokenKey : session?.spotify?.tokenKey;

    try {
        await deleteToken(provider, tokenKey!);

        await deleteSession(provider);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error as any });
    }
}
