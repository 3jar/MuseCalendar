import { UseLoaderReturn } from "@/hook/useLoader";

interface PrograssOverlayProps {
    sdkLoader: UseLoaderReturn;
}

export default function PrograssOverlay({ sdkLoader }: PrograssOverlayProps) {
    if (sdkLoader.state === "loading") {
        return (
            <div className="flex flex-col justify-center items-center z-50">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-white">Spotify SDK 초기화 중</h2>
                    <div className="bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                            className="bg-green-500 h-full transition-all duration-500 ease-out"
                            style={{
                                width: sdkLoader.messages.includes("스크립트 로딩")
                                    ? "20%"
                                    : sdkLoader.messages.includes("스크립트 로드 완료")
                                      ? "40%"
                                      : sdkLoader.messages.includes("Player 인스턴스 생성")
                                        ? "60%"
                                        : sdkLoader.messages.includes("액세스 토큰")
                                          ? "80%"
                                          : sdkLoader.messages.includes("Player 연결")
                                            ? "90%"
                                            : "10%",
                            }}
                        />
                    </div>
                    <p className="text-gray-300 text-lg mb-2">{sdkLoader.messages}</p>
                    <div className="flex justify-center space-x-2 mt-4">
                        <div
                            className={`w-2 h-2 rounded-full ${sdkLoader.messages.includes("스크립트") ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        <div
                            className={`w-2 h-2 rounded-full ${sdkLoader.messages.includes("Player 인스턴스") ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        <div
                            className={`w-2 h-2 rounded-full ${sdkLoader.messages.includes("액세스 토큰") ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        <div
                            className={`w-2 h-2 rounded-full ${sdkLoader.messages.includes("연결") ? "bg-green-400" : "bg-gray-600"}`}
                        />
                    </div>
                </div>
            </div>
        );
    } else if (sdkLoader.state === "error") {
        return (
            <div className="absolute inset-0 bg-red-900/80 flex flex-col justify-center items-center z-50">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-red-400">{sdkLoader.Icon}</div>
                    <h2 className="text-2xl font-bold mb-4 text-white">SDK 초기화 실패</h2>
                    <div className="bg-red-800 p-4 rounded-lg mb-4">
                        <p className="text-red-200 text-sm font-mono">{sdkLoader.messages}</p>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                sdkLoader.reset();
                                window.location.reload();
                            }}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            페이지 새로고침
                        </button>
                        <button
                            onClick={() => sdkLoader.reset()}
                            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
