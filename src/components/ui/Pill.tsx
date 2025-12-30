import { cn } from "@/lib/utils";

interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
    color: 'red' | 'yellow' | 'green';
}

export const Pill: React.FC<PillProps> = ({ children, color, className, ...props }) => {
    const colorClasses = {
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    return (
        <div
            className={cn("py-0.5 px-2 text-xs rounded-full border", colorClasses[color], className)}
            {...props}
        >
            {children}
        </div>
    );
};