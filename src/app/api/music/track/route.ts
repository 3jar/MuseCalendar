import { NextRequest, NextResponse } from "next/server";
import fetchSpotify from "@/utils/spotify/fetchSpotify";

function normalize(t: any) {
    return {
        trackId: t.id as string,
        name: t.name as string,
        artists: (t.artists ?? []).map((a: any) => a.name as string),
        album: t.album?.name ?? "",
        durationMs: t.duration_ms ?? 0,
        previewUrl: t.preview_url ?? null,
        imageUrl:
            t.album?.images?.[1]?.url ??
            t.album?.images?.[0]?.url ??
            t.album?.images?.[2]?.url ??
            null,
    };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("trackId") ?? searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "trackId query is required" }, { status: 400 });
    }

    try {
        const data = await fetchSpotify(`tracks/${encodeURIComponent(id)}`);
        return NextResponse.json(normalize(data));
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "track fetch error" }, { status: 500 });
    }
}
