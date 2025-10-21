import { NextResponse, NextRequest } from "next/server";
import fetchSpotify from "@/utils/spotify/fetchSpotify";
import getToken from "@/prisma/utils/getToken";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { deviceId, trackId, sessionKey } = body as {
            deviceId?: string;
            trackId?: string;
            sessionKey: string;
        };
        if (!deviceId || !trackId) {
            return NextResponse.json({ error: "missing deviceId or trackId" }, { status: 400 });
        }

        const accessToken = await getToken("SPOTIFY", sessionKey);

        await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });

        const uri = trackId.startsWith("spotify:track:") ? trackId : `spotify:track:${trackId}`;
        const url = `me/player/play?device_id=${encodeURIComponent(deviceId)}`;

        await fetchSpotify(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uris: [uri],
            }),
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("api/spotify/play error", err);
        return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
}
