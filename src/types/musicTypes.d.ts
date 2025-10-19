export type TrackItem = {
    trackId: string;
    name: string;
    artists: string[];
    album: string;
    durationMs: number;
    previewUrl: string | null;
    spotifyUrl: string;
    imageUrl: string | null;
    orderIndex?: number | null;
};
