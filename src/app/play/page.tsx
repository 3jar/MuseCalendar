import Client from "./Client";
import Script from "next/script";

export default function Page() {
    return (
        <>
            <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />
            <Client />
        </>
    );
}
