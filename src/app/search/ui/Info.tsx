import { MusicalNoteIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function Info() {
    return (
        <section
            className="w-full relative overflow-hidden px-10 py-20 cursor-default flex flex-col justify-center"
            style={{
                backgroundImage: `
              radial-gradient(600px 300px at 20% -10%, rgba(34,197,94,0.12), transparent 60%),
              radial-gradient(600px 300px at 90% 10%, rgba(255,255,255,0.06), transparent 60%),
              linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
            `,
                backgroundSize: `auto, auto, 50px 50px, 50px 50px`,
            }}
        >
            {/* 상단 라벨 */}
            <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1 text-xs text-neutral-300">
                    <MusicalNoteIcon className="h-4 w-4 text-green-400" />
                    MuseCalendar · 신청형 플레이리스트
                </span>
            </div>

            {/* 타이틀/부제 */}
            <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                오늘 하루를 <span className="text-green-400">당신이 고른 음악</span>으로 시작하세요
            </h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-6 text-neutral-300 md:text-base">
                원하는 트랙을 검색해 트레이에 담고, 날짜를 선택해 제출하면 방송용 플레이리스트로
                편성됩니다.
                <span className="hidden sm:inline">
                    {" "}
                    기상송/노동요 중 선택해서 나만의 플레이리스트로 하루를 시작해보세요.
                </span>
            </p>

            {/* 가이드 스텝 */}
            <ol className="mt-5 grid gap-3 text-sm text-neutral-200 sm:grid-cols-3">
                <li className="flex items-start gap-3 rounded border border-neutral-800 bg-neutral-900 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-950 text-[11px] font-bold text-green-400">
                        1
                    </span>
                    <div>
                        <div className="font-semibold">곡 검색</div>
                        <div className="text-neutral-400">상단 입력창에 제목/아티스트를 입력</div>
                    </div>
                </li>
                <li className="flex items-start gap-3 rounded border border-neutral-800 bg-neutral-900 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-950 text-[11px] font-bold text-green-400">
                        2
                    </span>
                    <div>
                        <div className="font-semibold">트레이 담기</div>
                        <div className="text-neutral-400">최소 5곡 선택(노동요는 최대 5곡)</div>
                    </div>
                </li>
                <li className="flex items-start gap-3 rounded border border-neutral-800 bg-neutral-900 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-950 text-[11px] font-bold text-green-400">
                        3
                    </span>
                    <div>
                        <div className="font-semibold">날짜 선택 & 제출</div>
                        <div className="text-neutral-400">달력에서 방송일 고르고 저장</div>
                    </div>
                </li>
            </ol>

            {/* 상태/주의 문구 (옵션) */}
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                <ExclamationCircleIcon className="h-4 w-4" />
                <span>중복된 날짜는 신청이 제한될 수 있어요. 달력의 회색 표시를 확인하세요.</span>
            </div>

            {/* 라디얼 하이라이트 데코 */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 right-10 h-[420px] w-[420px] rounded-full -z-5"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(34,197,94,0.15), rgba(34,197,94,0.08), rgba(34,197,94,0))",
                    filter: "blur(6px)",
                }}
            />
        </section>
    );
}
