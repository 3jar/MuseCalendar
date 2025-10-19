import { useState, useCallback, useMemo } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { JSX } from "react/jsx-dev-runtime";
import { Spinner } from "@/components/ui/spinner";

type LoaderState = "idle" | "loading" | "success" | "error";

export type UseLoaderReturn = {
    state: LoaderState;
    start: () => void;
    succeed: () => void;
    fail: () => void;
    reset: () => void;
    message: (arg: string) => void;
    messages: string;
    Icon: JSX.Element | null;
};

export default function useLoader(): UseLoaderReturn {
    const [state, setState] = useState<LoaderState>("idle");
    const [messages, setMessage] = useState<string>("");

    const start = useCallback(() => setState("loading"), []);
    const succeed = useCallback(() => setState("success"), []);
    const fail = useCallback(() => setState("error"), []);
    const reset = useCallback(() => setState("idle"), []);
    const message = useCallback((arg: string) => setMessage(arg), []);

    // 상태 → 아이콘 매핑
    const Icon = useMemo(() => {
        switch (state) {
            case "loading":
                return <Spinner />;
            case "success":
                return <CheckCircleIcon className="h-5 w-5" />;
            case "error":
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return null;
        }
    }, [state]);

    return { state, start, succeed, fail, reset, Icon, message, messages };
}
