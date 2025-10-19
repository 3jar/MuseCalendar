export type AppSession = {
    user: {
        id: string;
        name: string;
        displayId: string;
        exp: number;
        tokenKey: string;
        roles?: string[];
        grade?: number;
        class?: number;
        number?: number;
        generation?: number;
    };

    spotify?: {
        hasSpotify: boolean;
        userId: string;
        username: string;
        image: string;
        exp: number;
        tokenKey: string;
        explicit_content?: {
            filter_enabled: boolean;
            filter_locked: boolean;
        };
        product?: string;
        type?: string;
    };
};
