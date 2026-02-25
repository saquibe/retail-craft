"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, icon, className }: SectionTitleProps) {
  return (
    <div className={cn("flex items-center gap-2 mb-4", className)}>
      {icon && <div className="text-indigo-600">{icon}</div>}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex-1 h-px bg-gray-200 ml-4"></div>
    </div>
  );
}
