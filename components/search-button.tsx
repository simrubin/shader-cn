"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
  placeholder?: string;
  onClick?: () => void;
  className?: string;
}

export function SearchButton({
  placeholder = "Search presets...",
  onClick,
  className,
}: SearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        " hover:bg-secondary hover:text-accent-foreground",
        "h-9 pl-4 pr-2 py-2 w-full justify-start rounded-xl",
        "bg-secondary/80 text-sm font-medium text-muted-foreground shadow-none backdrop-blur-md",
        "md:w-40 lg:w-56 xl:w-64",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="hidden lg:inline-flex">{placeholder}</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <span className="pointer-events-none ml-auto hidden sm:flex items-center gap-0.5">
        <kbd className="flex items-center justify-center rounded-md border bg-muted text-lg font-medium pt-0.5 size-6">
          ⌘
        </kbd>
        <kbd className="flex items-center justify-center rounded-md border bg-muted text-sm font-medium size-6">
          K
        </kbd>
      </span>
    </button>
  );
}
