// app/auth/signin/page.tsx
"use client";
import { signIn, SignInResponse } from "next-auth/react";
import { useAppSession } from "@/hook/useAppSession";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { getErrorMessage } from "@/utils/errorMessage";
import { toast } from "sonner";
import { UserIcon, LockClosedIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/solid";

export default function SignIn() {
    const { session, status } = useAppSession();
    const router = useRouter();

    const [displayId, setDisplayId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 이미 로그인되어 있으면 홈으로
    useEffect(() => {
        if (status === "authenticated" && session?.user.id) router.replace("/");
    }, [status, router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!displayId || !password) {
            return toast.warning("아이디 또는 비밀번호를 입력해주세요");
        } else {
            setLoading(true);
            const res: SignInResponse | undefined = await signIn("main", {
                display_id: displayId,
                password,
                redirect: false,
            });
            if (!res || !res?.ok) {
                const errorMessage = getErrorMessage(res?.error ?? "");
                toast.error(errorMessage);
            } else {
                toast.success("로그인 되었습니다");
                router.push("/");
            }
        }
        setLoading(false);
    }

    return (
        <main className="w-full z-10 h-screen pt-[72px] p-6 flex flex-col items-center justify-center">
            <div className="w-full flex flex-col items-center gap-2">
                <Logo width={100} height={100} mode="light" />
                <span className="font-bold text-4xl text-green-500">MuseCalendar</span>
                <span className="text-foreground">강원과학고등학교 음악 관련 신청 프로그램</span>
            </div>
            <form onSubmit={onSubmit} className="w-[400px] mt-8 rounded-lg bg-black p-10">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <span className="text-2xl font-extrabold">로그인</span>
                    <div className="flex gap-1">
                        <span className="text-sm text-blue-500 font-extrabold">학다모</span>
                        <span className="text-sm">아이디와 비밀번호로 로그인하세요</span>
                    </div>
                </div>
                <div className="mb-5">
                    <span className="font-bold text-sm">아이디</span>
                    <div className="flex items-center px-3 bg-foreground rounded">
                        <UserIcon className="w-5 h-5 text-background" />
                        <input
                            className="w-full px-3 py-2 focus:outline-none text-background"
                            placeholder="기수+학번"
                            value={displayId}
                            onChange={(e) => setDisplayId(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mb-5">
                    <span className="font-bold text-sm">비밀번호</span>
                    <div className="flex items-center px-3 bg-foreground rounded">
                        <LockClosedIcon className="w-5 h-5 text-background" />
                        <input
                            className="w-full px-3 py-2 focus:outline-none text-background"
                            placeholder="비밀번호"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    className="flex justify-center items-center w-full mt-8 py-2 rounded-xl bg-green-500 text-white active:scale-95 disabled:opacity-50 duration-150 cursor-pointer"
                    disabled={loading}
                >
                    {loading ? (
                        "로그인 중..."
                    ) : (
                        <>
                            <ArrowRightEndOnRectangleIcon className="w-5 h-5 mr-1" />
                            로그인
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
