// useWindowMetrics.ts
import { useEffect, useRef, useState } from "react";

type WindowMetrics = {
    innerWidth: number;
    innerHeight: number;
    scrollX: number;
    scrollY: number;
    devicePixelRatio: number;
};

const SSR_SAFE: WindowMetrics = {
    innerWidth: 0,
    innerHeight: 0,
    scrollX: 0,
    scrollY: 0,
    devicePixelRatio: 1,
};

function readMetrics(): WindowMetrics {
    return typeof window === "undefined"
        ? SSR_SAFE
        : {
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              devicePixelRatio: window.devicePixelRatio ?? 1,
          };
}

export default function useWindowMetrics() {
    const [metrics, setMetrics] = useState<WindowMetrics>(SSR_SAFE);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        const schedule = () => {
            if (rafId.current != null) return;
            rafId.current = requestAnimationFrame(() => {
                rafId.current = null;
                setMetrics(readMetrics());
            });
        };

        window.addEventListener("resize", schedule, { passive: true });
        window.addEventListener("scroll", schedule, { passive: true });

        // 첫 업데이트
        schedule();

        return () => {
            window.removeEventListener("resize", schedule);
            window.removeEventListener("scroll", schedule);
            if (rafId.current != null) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return metrics;
}
