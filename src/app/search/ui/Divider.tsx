import { cn } from "@/lib/cn";

export default function Divider({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("w-full h-[1px] bg-neutral-700 relative", className)} {...props} />;
}
