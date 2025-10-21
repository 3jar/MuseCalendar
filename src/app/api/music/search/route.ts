// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import fetchSpotify from "@/utils/spotify/fetchSpotify";

import { TrackItem } from "@/types/musicTypes";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const limit = Number(searchParams.get("limit") ?? 20);
    const offset = Number(searchParams.get("offset") ?? 0);
    const market = searchParams.get("market") ?? "KR"; // 필요시 변경/노출

    if (!q) {
        return NextResponse.json({ error: "q is required" }, { status: 400 });
    }

    try {
        const data = await fetchSpotify(
            `search?q=${encodeURIComponent(q)}&type=track&limit=${limit}&offset=${offset}&market=${market}`,
            req
        );

        const items: TrackItem[] =
            data?.tracks?.items?.map((t: any) => ({
                trackId: t.id,
                name: t.name,
                artists: t.artists?.map((a: any) => a.name) ?? [],
                album: t.album?.name ?? "",
                durationMs: t.duration_ms ?? 0,
                previewUrl: t.preview_url ?? null,
                spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
                imageUrl:
                    t.album?.images?.[1]?.url ??
                    t.album?.images?.[0]?.url ??
                    t.album?.images?.[2]?.url ??
                    null,
            })) ?? [];

        return NextResponse.json({
            q,
            limit,
            offset,
            total: data?.tracks?.total ?? items.length,
            items,
            ok: true,
        });
    } catch (e) {
        return NextResponse.json(
            {
                error: e as any,
                ok: false,
            },
            { status: 500 }
        );
    }
}
