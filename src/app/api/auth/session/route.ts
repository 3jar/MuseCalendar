import { readSession } from "@/lib/session";
import { getMe, meSSORes, meSpotifyRes } from "@/utils/me";

export async function GET() {
    const session = await readSession();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 최신 SSO 정보 가져오기
    let ssoMe: meSSORes | null = null;
    try {
        ssoMe = await getMe("SSO");
    } catch (err) {
        console.warn("[session:get] Failed to fetch SSO me:", err);
    }

    // 추후 Spotify 정보 확장
    let spotifyMe: meSpotifyRes | null = null;
    if (session.spotify?.hasSpotify) {
        try {
            spotifyMe = await getMe("SPOTIFY");
        } catch (err) {
            console.warn("[session:get] Failed to fetch Spotify me:", err);
        }
    }

    // 병합 (ssoMe가 session.user보다 우선)
    const mergedSession = {
        ...session,
        user: { ...session.user, ...ssoMe },
        ...(spotifyMe
            ? {
                  spotify: { ...session.spotify, ...spotifyMe },
              }
            : {}),
    };

    return Response.json(mergedSession, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
    });
}
