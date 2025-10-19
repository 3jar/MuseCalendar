// app/api/playlists/today/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { readSession } from "@/lib/session";

export async function GET() {
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 오늘(Asia/Seoul) 00:00 ~ 23:59:59.999 → UTC로 환산
    const now = new Date();
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffsetMs);

    const kstStart = new Date(
        kstNow.getFullYear(),
        kstNow.getMonth(),
        kstNow.getDate(),
        0,
        0,
        0,
        0
    );
    const kstEnd = new Date(
        kstNow.getFullYear(),
        kstNow.getMonth(),
        kstNow.getDate(),
        23,
        59,
        59,
        999
    );

    const list = await prisma.playlist.findMany({
        where: {
            streamDate: { gte: kstStart, lte: kstEnd },
        },
        orderBy: { streamDate: "asc" },
    });

    return NextResponse.json(list);
}
