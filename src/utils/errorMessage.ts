// src/utils/errorMessages.ts
export function getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        RATE_LIMIT_EXCEEDED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        MISSING_FIELDS: "필수 입력값이 누락되었습니다.",
        INVALID_CLIENT: "잘못된 클라이언트 인증입니다.",
        ORIGIN_NOT_ALLOWED: "허용되지 않은 도메인에서의 요청입니다.",
        INVALID_CREDENTIALS: "아이디 또는 비밀번호가 잘못되었습니다.",
        PASSWORD_NOT_SET: "비밀번호가 설정되지 않았습니다. (첫 로그인 필요)",
        MISSING_TOKEN: "인증 토큰이 누락되었습니다.",
        INVALID_TOKEN: "잘못되었거나 만료된 토큰입니다.",
        CLIENT_MISMATCH: "토큰의 클라이언트 정보가 일치하지 않습니다.",
        INVALID_REFRESH_TOKEN: "잘못된 리프레시 토큰입니다.",
        REFRESH_TOKEN_NOT_FOUND: "리프레시 토큰을 찾을 수 없습니다.",
    };

    return messages[code] ?? "알 수 없는 오류가 발생했습니다.";
}
