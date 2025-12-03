"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { LucideIcon, GripVertical, Move, Bookmark, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// Predefined accent colors using oklch format
const ACCENT_COLORS = [
  {
    name: "Neutral",
    value: "oklch(0.205 0 0)",
    lightValue: "oklch(0.922 0 0)",
  },
  {
    name: "Rose",
    value: "oklch(0.645 0.246 16.439)",
    lightValue: "oklch(0.645 0.246 16.439)",
  },
  {
    name: "Orange",
    value: "oklch(0.705 0.213 47.604)",
    lightValue: "oklch(0.705 0.213 47.604)",
  },
  {
    name: "Amber",
    value: "oklch(0.769 0.188 70.08)",
    lightValue: "oklch(0.769 0.188 70.08)",
  },
  {
    name: "Lime",
    value: "oklch(0.768 0.233 130.85)",
    lightValue: "oklch(0.768 0.233 130.85)",
  },
  {
    name: "Emerald",
    value: "oklch(0.696 0.17 162.48)",
    lightValue: "oklch(0.696 0.17 162.48)",
  },
  {
    name: "Cyan",
    value: "oklch(0.715 0.143 215.221)",
    lightValue: "oklch(0.715 0.143 215.221)",
  },
  {
    name: "Blue",
    value: "oklch(0.623 0.214 259.815)",
    lightValue: "oklch(0.623 0.214 259.815)",
  },
  {
    name: "Violet",
    value: "oklch(0.627 0.265 303.9)",
    lightValue: "oklch(0.627 0.265 303.9)",
  },
  {
    name: "Pink",
    value: "oklch(0.656 0.241 354.308)",
    lightValue: "oklch(0.656 0.241 354.308)",
  },
];

interface DockProps {
  className?: string;
  isGridView: boolean;
  onToggleView: () => void;
  showBookmarksOnly: boolean;
  onToggleBookmarks: () => void;
  bookmarkCount: number;
  currentAccentColor: string;
  onAccentColorChange: (color: string, lightColor: string) => void;
}

interface DockIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  badge?: number;
  fillWhenActive?: boolean;
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  (
    { icon: Icon, label, onClick, className, isActive, badge, fillWhenActive },
    ref
  ) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            ref={ref}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
              "relative group p-3 rounded-2xl",
              "hover:bg-background/90 transition-colors",
              isActive && "bg-accent",
              className
            )}
          >
            <Icon
              className={cn(
                "size-5",
                isActive ? "text-accent-foreground" : "text-foreground"
              )}
              fill={isActive && fillWhenActive ? "currentColor" : "none"}
            />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={12}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
);
DockIconButton.displayName = "DockIconButton";

function AccentColorPicker({
  currentColor,
  onColorChange,
  isOpen,
  onToggle,
}: {
  currentColor: string;
  onColorChange: (color: string, lightColor: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className={cn(
              "relative group p-3 rounded-2xl",
              "hover:bg-background/90 transition-colors",
              isOpen && "bg-accent"
            )}
          >
            <div
              className="size-5 rounded-full ring-1 ring-inset ring-white/20 shadow-sm"
              style={{ backgroundColor: currentColor }}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={12}>
          <p>Accent Color</p>
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 p-3 rounded-2xl bg-popover border border-border shadow-lg"
          >
            <div className="grid grid-cols-5 gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    onColorChange(color.value, color.lightValue);
                    onToggle();
                  }}
                  className={cn(
                    "size-8 rounded-full transition-all",
                    "hover:scale-110 hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-popover",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-popover",
                    "flex items-center justify-center"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {currentColor === color.value && (
                    <Check className="size-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      isGridView,
      onToggleView,
      showBookmarksOnly,
      onToggleBookmarks,
      bookmarkCount,
      currentAccentColor,
      onAccentColorChange,
    },
    ref
  ) => {
    const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);

    // Close color picker when clicking outside
    React.useEffect(() => {
      if (!isColorPickerOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-dock-color-picker]")) {
          setIsColorPickerOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, [isColorPickerOpen]);

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          className
        )}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          className={cn(
            "flex items-center gap-1 p-2 rounded-3xl",
            "backdrop-blur-md  shadow-2xl",
            "bg-secondary/80 ",
            "hover:shadow-xl transition-shadow duration-300"
          )}
        >
          {/* View Toggle */}
          <DockIconButton
            icon={isGridView ? Move : GripVertical}
            label={isGridView ? "Canvas view" : "Grid view"}
            onClick={onToggleView}
            isActive={false}
          />

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Bookmarks */}
          <DockIconButton
            icon={Bookmark}
            label={showBookmarksOnly ? "Show all" : "Show bookmarks"}
            onClick={onToggleBookmarks}
            isActive={showBookmarksOnly}
            badge={bookmarkCount}
            fillWhenActive
          />

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Accent Color Picker */}
          <div data-dock-color-picker>
            <AccentColorPicker
              currentColor={currentAccentColor}
              onColorChange={onAccentColorChange}
              isOpen={isColorPickerOpen}
              onToggle={() => setIsColorPickerOpen(!isColorPickerOpen)}
            />
          </div>
        </motion.div>
      </div>
    );
  }
);
Dock.displayName = "Dock";

export { Dock, ACCENT_COLORS };
