import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { readSession } from "@/lib/session";
import { SongForm } from "@prisma/client";

export async function POST(req: Request) {
    const session = await readSession();
    if (!session?.user?.id)
        return NextResponse.json({ error: "unauthorized", ok: false }, { status: 401 });

    const { songform, streamDate } = await req.json();
    if (!(songform in SongForm) || !streamDate) {
        return NextResponse.json(
            { error: "songform and streamDate required", ok: false },
            { status: 400 }
        );
    }

    if (!streamDate) {
        return NextResponse.json({ error: "invalid streamDate", ok: false }, { status: 400 });
    }

    const pl = await prisma.playlist.create({
        data: {
            userId: session.user.id,
            songform,
            streamDate,
        },
    });

    return NextResponse.json({ pl, ok: true }, { status: 201 });
}

export async function GET(req: Request) {
    const playlists = await prisma.playlist.findMany({
        select: {
            songform: true,
            streamDate: true,
            userId: true,
        },
    });

    return NextResponse.json({ playlists, ok: true }, { status: 200 });
}
