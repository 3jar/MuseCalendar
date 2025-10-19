import { Archivo_Black } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { MenuBar } from "@/components/MenuBar";

const archivoBlack = Archivo_Black({
    variable: "--font-archivo-black",
    weight: "400",
    subsets: ["latin"],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <link rel="icon" href="/favicon.svg" sizes="any" />
            <body className={`${archivoBlack.variable} antialiased flex flex-col items-center`}>
                <MenuBar />
                <div
                    className="fixed inset-0 -z-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />
                {children}
                <footer className="w-full border-t border-white/10 bg-background py-8 text-center text-xs text-white/40 backdrop-blur">
                    © {new Date().getFullYear()} MuseCalendar · made for interactive music streams
                </footer>
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
