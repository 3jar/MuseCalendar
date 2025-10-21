// app/api/playlists/today/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { readSession } from "@/lib/session";

export async function GET() {
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 현재 UTC 기준 시각
    const now = new Date();

    // 어제 15:00 UTC
    const yesterdayUTC15 = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 1, // 어제
            15, // 15시
            0,
            0,
            0
        )
    );

    // ±30분 혹은 ±1시간 같은 시간 범위를 지정해 필터링하려면:
    const start = new Date(yesterdayUTC15.getTime() - 30 * 60 * 1000); // 14:30
    const end = new Date(yesterdayUTC15.getTime() + 30 * 60 * 1000); // 15:30

    const list = await prisma.playlist.findMany({
        where: {
            streamDate: { gte: start, lte: end },
        },
        orderBy: { streamDate: "asc" },
    });

    return NextResponse.json(list);
}
