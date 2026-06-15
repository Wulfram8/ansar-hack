import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Инициалы или короткий текст внутри аватара. */
  initials?: string;
  /** Размер стороны в пикселях. */
  size?: number;
}

/** Текстовый аватар (кружок с инициалами) — как в дизайне CRM. */
export function Avatar({ initials, size = 32, className, style, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), ...style }}
      {...props}
    >
      {initials}
    </div>
  );
}
