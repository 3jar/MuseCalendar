import { useState, useCallback, useMemo } from "react";
import ColorThief from "colorthief";

export default function usePallete() {
    const thief = useMemo(() => new ColorThief(), []);
    const [pallete, setPallete] = useState<string[]>([]);

    const extractPaletteFrom = useCallback(
        (img: HTMLImageElement | null) => {
            if (!img) {
                console.warn("Hook has no Images");
                setPallete(["rgb(0, 0, 0)"]);
                return;
            }
            try {
                const pal = thief.getPalette(img, 5) as Array<[number, number, number]>;
                setPallete(pal.map((rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`));
            } catch (e) {
                console.error("ColorThief palette error:", e);
                return;
            }
        },
        [thief]
    );

    return { pallete, extractPaletteFrom };
}
