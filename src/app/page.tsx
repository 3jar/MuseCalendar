"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Search, Sparkles } from "lucide-react";

export default function Home() {
    const router = useRouter();

    return (
        <div
            className="w-full bg-black text-white pt-[100px] min-h-screen"
            style={{
                backgroundImage: `linear-gradient(rgba(256, 256, 256, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgb(256, 256, 256, 0.1) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
            }}
        >
            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20 text-center max-w-6xl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }} // 초기 애니메이션용
                    className="inline-block mb-6 cursor-pointer"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-500/20 rounded-full backdrop-blur-sm shadow-2xl shadow-green-400">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">
                            실시간 음악 신청 · 큐 · 스트림
                        </span>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <span className="font-logo">MuseCalendar</span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    시청자가 <strong className="text-white">신청하고, 투표하고, 함께 듣는</strong>{" "}
                    스트리밍 큐.
                    <br />
                    진행자는 한 번의 클릭으로 재생과 순서를 컨트롤하세요.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <motion.a
                        className="bg-green-400 hover:bg-green-800 duration-150 hover:shadow-green-800/50 text-white px-5 py-3 rounded shadow-xl shadow-green-500/20 border-0 group relative overflow-hidden cursor-pointer"
                        href={"/play"}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 2000, damping: 20 }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            지금 시작하기
                        </span>
                    </motion.a>

                    <motion.button
                        className="flex items-center border-2 border-green-500/30 duration-150 bg-green-500/5 hover:bg-green-500/10 text-white px-5 py-3 text rounded backdrop-blur-sm cursor-pointer"
                        onClick={() => router.push("/search")}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 2000, damping: 20 }}
                    >
                        <Search className="w-5 h-5 mr-2" />
                        트랙 검색
                    </motion.button>
                </motion.div>
            </section>
        </div>
    );
}
