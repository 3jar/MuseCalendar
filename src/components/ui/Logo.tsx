interface LogoProps {
    width: number;
    height: number;
    mode: "dark" | "light";
}

export default function Logo(props: LogoProps) {
    return (
        <svg
            width={props.width}
            height={props.height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="M Logo"
        >
            <circle
                cx="50"
                cy="50"
                r="48"
                fill={props.mode === "light" ? "#fafaff" : "oklch(0.145 0 0)"}
            />
            <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="56"
                fontWeight="900"
                fontFamily="Inter, sans-serif"
                fill="#22c55e"
            >
                M
            </text>
        </svg>
    );
}
