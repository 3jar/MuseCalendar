"use client";
import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/hook/useAppSession";
import useLoader from "@/hook/useLoader";
import style from "@/styles/loginStyle.module.css";

import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

import SchoolLogo from "public/shcool-logo.png";
import SpotifyLogo from "public/spotify-logo.png";

export function SignInComp() {
    const { session, status, signOut } = useAppSession();
    const [open, setOpen] = useState<"sso" | "spotify" | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const spotifynLoader = useLoader();

    // Handle focus management
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(null);
            }
        }

        function handleFocusOut() {
            setTimeout(() => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(document.activeElement as Node)
                ) {
                    setOpen(null);
                }
            }, 0);
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("focusout", handleFocusOut);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
                document.removeEventListener("focusout", handleFocusOut);
            };
        }
    }, [open]);

    async function SignInToSpotify() {
        spotifynLoader.start();
        try {
            await signIn("spotify", { callbackUrl: "/" });
            spotifynLoader.succeed();
        } catch (Error) {
            spotifynLoader.fail();
            throw Error;
        }
    }

    if (status === "authenticated") {
        return (
            <div
                ref={containerRef}
                className={cn(
                    "relative h-[43px] bg-foreground rounded-full p-1 text-background duration-150 flex items-center gap-[5px]",
                    style.container
                )}
            >
                <button
                    className="cursor-pointer rounded-full"
                    onClick={() => setOpen(open === "sso" ? null : "sso")}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpen(open === "sso" ? null : "sso");
                        }
                    }}
                >
                    <Image
                        width={35}
                        height={35}
                        src={SchoolLogo}
                        alt="프로필 이미지"
                        className={cn("rounded-full z-20", style.profileImage)}
                    />
                </button>
                {session?.spotify ? (
                    <button
                        className={cn("rounded-full cursor-pointer", style.spotifyImage)}
                        onClick={() => setOpen(open === "spotify" ? null : "spotify")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOpen(open === "spotify" ? null : "spotify");
                            }
                        }}
                    >
                        <Image
                            width={35}
                            height={35}
                            src={session.spotify.image}
                            alt="프로필 이미지"
                            className="rounded-full"
                        />
                    </button>
                ) : (
                    <button
                        className={cn(
                            "flex items-center overflow-hidden",
                            "rounded-full",
                            "cursor-pointer",
                            style.spotifyImage
                        )}
                        onClick={() => setOpen(open === "spotify" ? null : "spotify")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOpen(open === "spotify" ? null : "spotify");
                            }
                        }}
                    >
                        <Image src={SpotifyLogo} alt="스포티파이 로고" width={35} height={35} />
                    </button>
                )}
                {open && (
                    <div
                        className="absolute right-0 top-full mt-2 w-48 origin-top-right bg-foreground rounded-md shadow-lg transition-all duration-200 z-50"
                        onMouseEnter={() => {}}
                        onFocus={() => {}}
                    >
                        <ul
                            className={cn(
                                "p-2 text-sm space-y-1 flex flex-col justify-center",
                                style.dropdown
                            )}
                        >
                            {open === "sso" && (
                                <>
                                    <li>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-background"
                                            onClick={() => {
                                                setOpen(null);
                                                // Add profile action here
                                            }}
                                        >
                                            프로필 보기
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-red-600"
                                            onClick={() => {
                                                setOpen(null);
                                                signOut("SSO");
                                            }}
                                        >
                                            로그아웃
                                        </button>
                                    </li>
                                </>
                            )}
                            {open === "spotify" && (
                                <>
                                    {session?.spotify?.hasSpotify ? (
                                        <>
                                            <li className="flex items-center">
                                                <Image
                                                    width={35}
                                                    height={35}
                                                    src={session.spotify.image}
                                                    alt="프로필 이미지"
                                                    className="rounded-full"
                                                />
                                                <div className="flex flex-col justify-center">
                                                    <span className="text font-bold">
                                                        {session?.spotify?.username}
                                                    </span>
                                                    <span className="text-sm text-neutral-500">
                                                        {session?.spotify?.product}
                                                    </span>
                                                </div>
                                            </li>
                                            <li className="mx-1 w-auto h-[1px] rounded-full bg-gray-300" />
                                            <li>
                                                <button
                                                    className="block w-full rounded text-left px-4 py-2 hover:bg-gray-200 text-red-600 cursor-pointer duration-150"
                                                    onClick={() => {
                                                        setOpen(null);
                                                        signOut("SPOTIFY");
                                                    }}
                                                >
                                                    Spotify 연결 해제
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <li>
                                            <button
                                                className="block w-full text-center px-4 py-2 bg-green-500 hover:bg-green-600 duration-150 rounded cursor-pointer"
                                                onClick={() => {
                                                    setOpen(null);
                                                    SignInToSpotify();
                                                }}
                                            >
                                                <span className="font-bold">스포티파이 로그인</span>
                                            </button>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    } else if (status === "unauthenticated") {
        return (
            <button
                className={cn(
                    "bg-foreground rounded-full px-4 py-1 ml-[10px] text-background duration-150 cursor-pointer",
                    "hover:brightness-75",
                    "active:scale-95"
                )}
                onClick={() => router.push("/auth/signin")}
            >
                Log In
            </button>
        );
    }

    // 로딩 상태 처리 (optional)
    return (
        <div className="flex gap-[5px] p-1">
            <Skeleton className="rounded-full w-[35px] h-[35px] bg-neutral-700" />
            <Skeleton className="rounded-full w-[35px] h-[35px] bg-neutral-700" />
        </div>
    );
}
