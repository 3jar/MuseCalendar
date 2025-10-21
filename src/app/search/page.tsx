import Client from "./Client";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Client />
        </Suspense>
    );
}
