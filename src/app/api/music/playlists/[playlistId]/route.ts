// app/api/music/playlists/[playlistId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { readSession } from "@/lib/session";

import { TrackItem } from "@/types/musicTypes";

// GET: fetch playlist items (trackId & orderIndex) for a given playlist
export async function GET(
    _req: NextRequest,
    { params: paramsPromise }: { params: Promise<{ playlistId: string }> }
) {
    const params = await paramsPromise;
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const pl = await prisma.playlist.findUnique({
        where: { id: params.playlistId },
        include: {
            items: {
                select: { trackId: true, orderIndex: true },
                orderBy: { orderIndex: "asc" },
            },
        },
    });

    if (!pl) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    return NextResponse.json(pl.items);
}

// PATCH: update playlist meta (title, streamDate)
export async function PATCH(
    req: NextRequest,
    { params: paramsPromise }: { params: Promise<{ playlistId: string }> }
) {
    const params = await paramsPromise;
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { title, streamDate } = await req.json();
    const pl = await prisma.playlist.findUnique({ where: { id: params.playlistId } });
    if (!pl || pl.userId !== session.user.id)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const data: Record<string, any> = {};
    if (title) data.title = title;
    if (streamDate) {
        const d = new Date(streamDate);
        if (isNaN(d.getTime()))
            return NextResponse.json({ error: "invalid streamDate" }, { status: 400 });
        data.streamDate = d;
    }

    const updated = await prisma.playlist.update({ where: { id: pl.id }, data });
    return NextResponse.json(updated);
}

type trackType = Pick<TrackItem, "trackId" | "orderIndex">;

// POST: add tracks to a playlist (body: { trackIds: string[] } | { trackId: string })
export async function POST(
    req: NextRequest,
    { params: paramsPromise }: { params: Promise<{ playlistId: string }> }
) {
    const params = await paramsPromise;
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const pl = await prisma.playlist.findUnique({ where: { id: params.playlistId } });
    if (!pl || pl.userId !== session.user.id)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body: trackType[] = await req.json();

    if (body.length === 0) {
        return NextResponse.json(
            { error: "trackIds (or trackId) and orderIndex are required!" },
            { status: 400 }
        );
    }

    const rows = body.map((row) => ({
        playlistId: pl.id,
        trackId: row.trackId,
        orderIndex: row.orderIndex!,
    }));

    await prisma.playlistTrack.createMany({ data: rows, skipDuplicates: true });

    return NextResponse.json({ id: pl.id });
}
