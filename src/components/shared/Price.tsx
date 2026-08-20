import { formatPrice } from "@/src/lib/utils";

interface PriceProps {
  amount: number | string;
  compareAtPrice?: number | string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Price({
  amount,
  compareAtPrice,
  className = "",
  size = "md",
}: PriceProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-medium text-neutral-900 ${sizeClasses[size]}`}>
        {formatPrice(amount)}
      </span>
      {compareAtPrice && (
        <span className="text-sm text-neutral-400 line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
