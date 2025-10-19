import "server-only";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import getSSOtoken from "./getSSOtoken";

const SSO_BASE = process.env.SSO_BASE!;

export default async function fetchSSO(endpoint: string, options: RequestInit = {}) {
    const session_user = await readSession();
    const session = session_user!.user;

    if (!session) return NextResponse.redirect(new URL("/auth/signin", process.env.NEXTAUTH_URL));
    const accessToken = await getSSOtoken(session.tokenKey);

    const clean = endpoint.replace(/^\/+/, "");

    const userHeaders = new Headers(options.headers as HeadersInit | undefined);
    const headers = new Headers({
        "Content-Type": "application/json",
        Origin: process.env.NEXTAUTH_URL ?? "",
    });

    userHeaders.forEach((v, k) => headers.set(k, v));

    headers.set("Authorization", `Bearer ${accessToken}`);

    const res = await fetch(`${SSO_BASE}/${clean}`, {
        ...options,
        headers,
        cache: "no-store",
    });

    if (res.status === 204) {
        return null;
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        let reason = res.statusText;
        try {
            const err = text ? JSON.parse(text) : {};
            reason = err?.error?.message || err?.message || reason;
        } catch {}
        throw new Error(
            `SSO API error ${res.status}: ${reason} \n Requesets : ${SSO_BASE}/${clean} : {${options}, ${headers}}`
        );
    }

    // JSON 응답
    return res.json();
}
