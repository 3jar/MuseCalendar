export type SsoLoginRes = {
    success: boolean;
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_expires_in: number;
    user: { id: string; display_id: string; name: string };
    scope: string;
};

export type SsoRefreshRes = {
    success: boolean;
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope: string;
};

const SSO_BASE = process.env.SSO_BASE!;

export async function ssoLogin(display_id: string, password: string) {
    const r = await fetch(`${SSO_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: process.env.NEXTAUTH_URL ?? "" },
        body: JSON.stringify({
            client_id: process.env.SIVELOP_CLIENT_ID!,
            client_secret: process.env.SIVELOP_CLIENT_SECRET!,
            display_id,
            password,
            scopes: ["basic", "profile", "roles"],
        }),
        cache: "no-store",
    });

    const data = (await r.json().catch(() => ({}))) as Partial<SsoLoginRes>;
    if (!r.ok || !data.success) {
        const errorCode = (data as any).error_code;
        return { ok: false, errorCode };
    }

    return { ok: true, data };
}

export async function ssoRefresh(refreshToken: string) {
    const r = await fetch(`${SSO_BASE}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: process.env.NEXTAUTH_URL ?? "" },
        body: JSON.stringify({
            client_id: process.env.SIVELOP_CLIENT_ID!,
            client_secret: process.env.SIVELOP_CLIENT_SECRET!,
            refresh_token: refreshToken,
        }),
    });
    const data = (await r.json().catch(() => ({}))) as Partial<SsoRefreshRes>;
    if (!r.ok || !data.success) throw new Error("SSO refresh failed");
    return data as SsoRefreshRes;
}
