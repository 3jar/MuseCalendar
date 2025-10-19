// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "./lib/session";

export const config = {
    matcher: ["/((?!api|auth/signin|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/signin")) {
        return NextResponse.next();
    }

    const session = await readSession();

    if (!session?.user.id && pathname !== "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/auth/signin";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
