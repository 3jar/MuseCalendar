// src/prisma/client.ts (server only)

import { PrismaClient } from "@prisma/client";

declare global {
    // allow global `var` in Node.js
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// 선택 1) named export만 쓰기
// export { prisma };

// 선택 2) default로 쓰고 싶다면 아래 줄만 남기기
export default prisma;
