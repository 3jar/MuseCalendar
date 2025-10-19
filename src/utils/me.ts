import { NextResponse } from "next/server";
import fetchSSO from "@/utils/sso/fetchSSO";
import fetchSpotify from "@/utils/spotify/fetchSpotify";
import { TokenProvider } from "@prisma/client";

export type ApiOk<T> = { ok: true; provider: TokenProvider; data: T };
export type ApiErr = { ok: false; provider?: TokenProvider; code: string; message: string };

export type meSSORes = {
    sub: string;
    id: string;
    display_id: string;
    name: string;
    grade: number;
    class: number;
    number: number;
    generation: number;
    student_info: string;
    roles: string[];
    role: string;
};

export type meSpotifyRes = {
    display_name: string;
    explicit_content: {
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    href: string;
    id: string;
    images: { url: string; height: number | null; width: number | null }[];
    product: string;
    type: string;
    uri: string;
};

function err(status: number, code: string, message: string): NextResponse<ApiErr> {
    return NextResponse.json({ ok: false, code, message }, { status });
}

type PromiseType = meSSORes | meSpotifyRes;

export function getMe(provider: "SSO"): Promise<meSSORes>;
export function getMe(provider: "SPOTIFY"): Promise<meSpotifyRes>;

export async function getMe(provider: TokenProvider): Promise<PromiseType> {
    if (provider === "SSO") {
        try {
            const res_sso: meSSORes = await fetchSSO("/userinfo");
            return res_sso;
        } catch (e) {
            throw err(
                401,
                "SSO_PROFILE_FAILED",
                e instanceof Error ? e.message : "SSO 프로필 조회 실패"
            );
        }
    } else if (provider === "SPOTIFY") {
        try {
            const res_spotify: meSpotifyRes = await fetchSpotify("/me");
            return res_spotify;
        } catch (e) {
            throw err(
                401,
                "SPOTIFY_PROFILE_FAILED",
                e instanceof Error ? e.message : "Spotify 프로필 조회 실패"
            );
        }
    }

    throw err(400, "INVALID_PROVIDER", `Unknown provider: ${provider}`);
}
