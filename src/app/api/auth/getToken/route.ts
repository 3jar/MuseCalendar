import getToken from "@/prisma/utils/getToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider, tokenKey } = body;

        if (!provider || !tokenKey) {
            return NextResponse.json({ error: "Missing provider or tokenKey" }, { status: 400 });
        }

        const token = await getToken(provider, tokenKey);

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 404 });
        }

        return NextResponse.json({ accessToken: token.accessToken, ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", ok: false }, { status: 500 });
    }
}
