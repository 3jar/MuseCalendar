import { Archivo_Black } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";

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
            <body className={cn(archivoBlack.variable, "overflow-hidden")}>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
