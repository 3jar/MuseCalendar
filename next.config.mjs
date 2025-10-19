export default {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "i.scdn.co" }, // 앨범아트 기본
            { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" }, // 때때로 사용
            { protocol: "https", hostname: "mosaic.scdn.co" }, // 모자이크 썸네일
            { protocol: "https", hostname: "seeded-session-images.scdn.co" }, // 추천 세션
        ],
    },
};
