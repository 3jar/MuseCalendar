import getToken from "@/prisma/utils/getToken";
import upsertTokenRecord from "@/prisma/utils/upsertToken";
import { ssoRefresh, SsoRefreshRes } from "@/lib/sso";
import { redirect } from "next/navigation";

const SKEW_MS = 60_000;

export default async function getSSOtoken(sessionKey: string): Promise<string> {
    const row = await getToken("SSO", sessionKey, [
        "id",
        "accessToken",
        "accessTokenExpires",
        "refreshToken",
        "refreshTokenExpires",
    ] as const);

    const now = new Date();

    if (!row || row.refreshTokenExpires.getTime() - now.getTime() <= SKEW_MS)
        redirect("/auth/signin");

    if (!row || row.accessTokenExpires - now.getTime() <= SKEW_MS) {
        const fresh: SsoRefreshRes = await ssoRefresh(row?.refreshToken);
        await upsertTokenRecord({
            provider: "SSO",
            subject: row!.subject,
            accessToken: row.accessToken,
            accessTokenExpires: new Date(fresh.expires_in),
        });
        return fresh.access_token;
    }

    return row.accessToken as string;
}
