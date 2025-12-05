"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Bookmark } from "lucide-react";

interface Preset {
  name: string;
  description: string;
  category: string;
  code: string;
  image?: string;
}

interface AnimatedCardProps {
  cellKey: string;
  x: number;
  y: number;
  preset: Preset;
  inViewport: boolean;
  isDragging: boolean;
  onClick: () => void;
  cardWidth: number;
  cardHeight: number;
  shouldAnimate?: boolean;
  enableAnimation: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (presetName: string) => void;
}

export function AnimatedCard({
  cellKey,
  x,
  y,
  preset,
  isDragging,
  onClick,
  cardWidth,
  cardHeight,
  enableAnimation,
  isBookmarked = false,
  onBookmarkToggle,
}: AnimatedCardProps) {
  // Generate a stable random delay for this card instance (0 to 0.08 seconds) - near instant stagger
  const randomDelay = React.useMemo(() => Math.random() * 0.08, []);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(preset.name);
  };

  return (
    // Outer positioning container - handles layout only
    <div
      className="absolute"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: cardWidth,
        height: cardHeight,
        willChange: isDragging ? "transform" : "auto",
      }}
      onClick={onClick}
    >
      {/* Inner animation container - handles visual effects (scale, opacity, blur) */}
      <motion.div
        className="w-full h-full rounded-[40px] hover:scale-[1.02] transition-all duration-300 overflow-hidden group cursor-pointer relative shadow-xl hover:shadow-2xl"
        initial={{
          opacity: enableAnimation ? 0 : 1,
          scale: enableAnimation ? 0.6 : 1,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.05,
        }}
        transition={{
          duration: 0.15,
          ease: [0.22, 1.2, 0.36, 1],
          delay: enableAnimation ? randomDelay : 0,
        }}
      >
        {preset.image ? (
          <>
            <img
              src={preset.image}
              alt={preset.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-slate-500 font-medium text-sm">
              No Preview
            </span>
          </div>
        )}

        {/* Bookmark button - top right, visible on hover */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-4 right-4 p-2 rounded-xl bg-black/20  opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 z-10"
        >
          <Bookmark
            className={`size-5 transition-colors ${
              isBookmarked ? "fill-white text-white" : "text-white/80"
            }`}
          />
        </button>

        {/* Gradient overlay - visible on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Blur effect at bottom - visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mask-[linear-gradient(to_top,black_60%,transparent)]" />

        {/* Content overlay - visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="text-lg font-normal text-white">{preset.name}</div>
          <div className="text-sm text-white/70 mt-0.5">{preset.category}</div>
        </div>
      </motion.div>
    </div>
  );
}
