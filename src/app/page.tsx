"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Music, Play, Search, Sparkles, Radio } from "lucide-react";

export default function Home() {
    const router = useRouter();

    return (
        <div className="w-full min-h-screen  text-white overflow-hidden relative">
            {/* Animated gradient background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-cyan-500/5 to-purple-500/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-24">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center max-w-6xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="inline-block mb-6"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
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
                        <span className="" style={{ fontFamily: "var(--font-archivo-black)" }}>
                            MuseCalendar
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        시청자가{" "}
                        <strong className="text-white">신청하고, 투표하고, 함께 듣는</strong>{" "}
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
                        <motion.button
                            className="bg-green-600 hover:bg-green-800 duration-150 hover:shadow-green-800/50 text-white px-5 py-3 rounded shadow-lg shadow-green-500/20 border-0 group relative overflow-hidden cursor-pointer"
                            onClick={() => router.push("/play")}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 2000, damping: 20 }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                지금 시작하기
                            </span>
                        </motion.button>

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

                {/* Features Section */}
                <section className="container mx-auto px-6 py-16 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                title: "한 번에 재생",
                                desc: "큐에 들어온 요청을 클릭 한 번으로 재생. 스트리밍 환경에 최적화.",
                                icon: Play,
                                color: "from-green-500 to-emerald-500",
                            },
                            {
                                title: "투표 & 우선순위",
                                desc: "시청자 투표로 정렬, 진행자는 고정/스킵/재정렬 컨트롤 제공.",
                                icon: Radio,
                                color: "from-cyan-500 to-blue-500",
                            },
                            {
                                title: "자동 배경 아트",
                                desc: "앨범아트 기반 팔레트 추출 → 배경/그라데이션 자동 매칭.",
                                icon: Music,
                                color: "from-purple-500 to-pink-500",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur group hover:border-green-500/30 transition-all duration-300"
                            >
                                {/* Light line effect */}
                                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                </div>

                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
