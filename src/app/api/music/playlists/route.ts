import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { readSession } from "@/lib/session";
import { SongForm } from "@prisma/client";

export async function POST(req: Request) {
    const session = await readSession();
    if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { songform, streamDate } = await req.json();
    if (!(songform in SongForm) || !streamDate) {
        return NextResponse.json({ error: "songform and streamDate required" }, { status: 400 });
    }

    const d = new Date(streamDate);
    if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "invalid streamDate" }, { status: 400 });
    }

    const pl = await prisma.playlist.create({
        data: {
            userId: session.user.id,
            songform,
            streamDate: d,
        },
    });

    return NextResponse.json(pl, { status: 201 });
}

export async function GET(req: Request) {
    const playlists = await prisma.playlist.findMany({
        select : {
            songform : true,
            streamDate : true
        }
    })

    return NextResponse.json(playlists)
}