import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import SpotifyProvider from "next-auth/providers/spotify";
import { cookies } from "next/headers";

import { ssoLogin } from "@/lib/sso";
import { setSession, readSession } from "@/lib/session";

import { AppSession } from "@/types/auth";
import { meSSORes, meSpotifyRes, getMe } from "@/utils/me";

import upsertTokenRecord from "@/prisma/utils/upsertToken";

const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            id: "main",
            name: "One SSO",
            credentials: {
                display_id: { label: "Display ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.display_id || !credentials?.password) return null;
                const sso = await ssoLogin(credentials.display_id, credentials.password);
                if (!sso.ok) throw new Error(sso.errorCode);
                return {
                    __sso: sso.data,
                } as any;
            },
        }),
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization:
                "https://accounts.spotify.com/authorize?scope=streaming,user-read-email,user-read-private,user-modify-playback-state,user-read-playback-state", // 필요한 스코프만
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            const jar = await cookies();
            const existing = jar.get("app_session");

            let prev: AppSession | null = null;
            if (existing?.value) {
                try {
                    const prev_value = await readSession();
                    prev = prev_value;
                } catch {
                    prev = null;
                }
            }
            const { spotify: spotify_prev, user: user_prev } = (prev ?? {}) as any;

            if (account?.provider === "main" && (user as any).__sso) {
                const sso = (user as any).__sso as {
                    access_token: string;
                    refresh_token: string;
                    scope: string;
                    expires_in: number;
                    refresh_expires_in: number;
                    user: { id: string; display_id: string; name: string };
                };

                const { sessionKey: ssoSessionKey } = await upsertTokenRecord({
                    provider: "SSO",
                    subject: sso.user.id,
                    accessToken: sso.access_token,
                    refreshToken: sso.refresh_token,
                    accessTokenExpires: Date.now() + sso.expires_in * 1000,
                    refreshTokenExpires: Date.now() + sso.refresh_expires_in * 1000,
                    scope: (sso as any).scope ?? null,
                    meta: { displayId: sso.user.display_id, name: sso.user.name },
                });

                let extendedSSOInfo: meSSORes | null = null;
                try {
                    extendedSSOInfo = await getMe("SSO");
                } catch {
                    extendedSSOInfo = null;
                }

                await setSession({
                    user: {
                        id: sso.user.id,
                        name: sso.user.name,
                        displayId: sso.user.display_id,
                        exp: undefined as unknown as number,
                        tokenKey: ssoSessionKey!,
                        roles: extendedSSOInfo?.roles ?? undefined,
                        grade: extendedSSOInfo?.grade ?? undefined,
                        class: extendedSSOInfo?.class ?? undefined,
                        number: extendedSSOInfo?.number ?? undefined,
                        generation: extendedSSOInfo?.generation ?? undefined,
                    },
                    spotify: spotify_prev,
                });

                delete (user as any).__sso;

                return true;
            }

            if (account?.provider === "spotify") {
                const accessToken = account.access_token!;
                const refreshToken = account.refresh_token!;
                const expiresAtSec =
                    (typeof account.expires_at === "number" ? account.expires_at : undefined) ??
                    Math.floor(Date.now() / 1000) + 3600;

                const userId = account.providerAccountId!;
                const username = (profile as any)?.display_name ?? userId;

                const image =
                    (profile as any)?.images?.[0]?.url ??
                    (profile as any)?.image ??
                    (user as any)?.image ??
                    null;

                const { sessionKey: spotifySessionKey } = await upsertTokenRecord({
                    provider: "SPOTIFY",
                    subject: userId,
                    accessToken,
                    refreshToken,
                    accessTokenExpires: expiresAtSec * 1000,
                    meta: {
                        userId,
                        name: (profile as any)?.display_name ?? (user as any)?.name ?? null,
                        image,
                    },
                });

                let extendedSpotifyInfo: meSpotifyRes | null = null;
                try {
                    extendedSpotifyInfo = await getMe("SPOTIFY");
                } catch {
                    extendedSpotifyInfo = null;
                }

                await setSession({
                    user: user_prev,
                    spotify: {
                        hasSpotify: true,
                        userId,
                        username,
                        image,
                        exp: expiresAtSec * 1000,
                        tokenKey: spotifySessionKey!,
                        explicit_content: extendedSpotifyInfo?.explicit_content ?? undefined,
                        product: extendedSpotifyInfo?.product ?? undefined,
                        type: extendedSpotifyInfo?.type ?? undefined,
                    },
                });

                return true;
            }

            return true;
        },

        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl + "/";
        },
    },

    pages: { signIn: "/auth/signin" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
