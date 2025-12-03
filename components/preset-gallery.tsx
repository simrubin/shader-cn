"use client";

import * as React from "react";
import {
  X,
  Command as CommandIcon,
  Moon,
  Sun,
  Settings,
  Info,
  Download,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "./animated-card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProviderWithConfig,
  TooltipTrigger,
} from "./ui/tooltip";
import { SearchButton } from "./search-button";
import { Dock, ACCENT_COLORS } from "./dock";

interface Preset {
  name: string;
  description: string;
  category: string;
  code: string;
  image?: string;
}

interface PresetGalleryProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  onClose?: () => void;
}

// ============ TOGGLEABLE LAYOUT SETTINGS ============
const CARD_WIDTH = 200;
const CARD_HEIGHT = 200;

// Distance settings (edge-to-edge between adjacent cards)
const MIN_SPACING = 100; // Minimum gap between cards
const MAX_SPACING = 280; // Maximum gap between cards

// Randomness factor (0 = perfect grid, 1 = full scatter)
const RANDOMNESS = 1.5;

// Calculated values based on min/max spacing
const BASE_GAP = (MIN_SPACING + MAX_SPACING) / 2;
const RANDOM_OFFSET_RANGE = ((MAX_SPACING - MIN_SPACING) / 4) * RANDOMNESS;

const CELL_WIDTH = CARD_WIDTH + BASE_GAP;
const CELL_HEIGHT = CARD_HEIGHT + BASE_GAP;
// =====================================================

// Seeded random function for consistent positioning based on cell coordinates
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Get random offset for a cell that's consistent across re-renders
function getRandomOffset(c: number, r: number): { x: number; y: number } {
  const seedX = c * 1000 + r;
  const seedY = c + r * 1000;

  return {
    x: (seededRandom(seedX) - 0.5) * RANDOM_OFFSET_RANGE * 2,
    y: (seededRandom(seedY) - 0.5) * RANDOM_OFFSET_RANGE * 2,
  };
}

// Local storage key for bookmarks
const BOOKMARKS_STORAGE_KEY = "shader-preset-bookmarks";
const ACCENT_COLOR_STORAGE_KEY = "shader-accent-color";

export function PresetGallery({
  presets,
  onSelect,
  onClose,
}: PresetGalleryProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openCommand, setOpenCommand] = React.useState(false);
  const [isGridView, setIsGridView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastOffset = React.useRef({ x: 0, y: 0 });
  const dragDistance = React.useRef(0);
  const seenCells = React.useRef(new Set<string>()); // Track which cells have been rendered
  const [isInitialRender, setIsInitialRender] = React.useState(true);

  // Bookmark state
  const [bookmarkedPresets, setBookmarkedPresets] = React.useState<Set<string>>(
    new Set()
  );
  const [showBookmarksOnly, setShowBookmarksOnly] = React.useState(false);

  // Accent color state
  const [currentAccentColor, setCurrentAccentColor] = React.useState(
    ACCENT_COLORS[0].value
  );

  // Load bookmarks and accent color from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (savedBookmarks) {
        try {
          setBookmarkedPresets(new Set(JSON.parse(savedBookmarks)));
        } catch (e) {
          console.error("Failed to parse bookmarks:", e);
        }
      }

      const savedAccentColor = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
      if (savedAccentColor) {
        setCurrentAccentColor(savedAccentColor);
        // Apply the saved color
        document.documentElement.style.setProperty(
          "--primary",
          savedAccentColor
        );
      }
    }
  }, []);

  // Save bookmarks to localStorage
  const handleBookmarkToggle = React.useCallback((presetName: string) => {
    setBookmarkedPresets((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(presetName)) {
        newBookmarks.delete(presetName);
      } else {
        newBookmarks.add(presetName);
      }
      // Save to localStorage
      localStorage.setItem(
        BOOKMARKS_STORAGE_KEY,
        JSON.stringify([...newBookmarks])
      );
      return newBookmarks;
    });
  }, []);

  // Handle accent color change
  const handleAccentColorChange = React.useCallback(
    (color: string, lightColor: string) => {
      setCurrentAccentColor(color);
      // Apply the color to CSS variables
      document.documentElement.style.setProperty("--primary", color);
      // Save to localStorage
      localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, color);
    },
    []
  );

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const categories = React.useMemo(
    () => Array.from(new Set(presets.map((p) => p.category))),
    [presets]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter presets based on search and bookmarks
  const filteredPresets = React.useMemo(() => {
    let result = presets;

    // Filter by bookmarks first
    if (showBookmarksOnly) {
      result = result.filter((p) => bookmarkedPresets.has(p.name));
    }

    // Then filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [presets, searchQuery, showBookmarksOnly, bookmarkedPresets]);

  // Clear seen cells when search changes
  React.useEffect(() => {
    seenCells.current.clear();
  }, [filteredPresets]);

  // Handle Dragging with RAF for smooth updates
  const rafRef = React.useRef<number | undefined>(undefined);
  const pendingOffset = React.useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    lastOffset.current = { ...offset };
    dragDistance.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragDistance.current += Math.abs(e.movementX) + Math.abs(e.movementY);

    // Store pending offset
    pendingOffset.current = {
      x: lastOffset.current.x + dx,
      y: lastOffset.current.y + dy,
    };

    // Use RAF to batch updates
    if (rafRef.current === undefined) {
      rafRef.current = requestAnimationFrame(() => {
        setOffset(pendingOffset.current);
        rafRef.current = undefined;
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  };

  // Calculate visible grid
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Mark initial render as complete after first paint
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getVisibleCells = React.useMemo(() => {
    if (dimensions.width === 0) return [];

    const startCol = Math.floor(-offset.x / CELL_WIDTH);
    const endCol = Math.ceil((dimensions.width - offset.x) / CELL_WIDTH);
    const startRow = Math.floor(-offset.y / CELL_HEIGHT);
    const endRow = Math.ceil((dimensions.height - offset.y) / CELL_HEIGHT);

    const buffer = 2; // Increased buffer to prevent pop-in
    const cells = [];

    const numPresets = filteredPresets.length;
    if (numPresets === 0) return [];

    const colsPerBlock = Math.ceil(Math.sqrt(numPresets));

    for (let c = startCol - buffer; c < endCol + buffer; c++) {
      for (let r = startRow - buffer; r < endRow + buffer; r++) {
        const linearIndex = c + r * colsPerBlock;
        const index = ((linearIndex % numPresets) + numPresets) % numPresets;
        const randomOffset = getRandomOffset(c, r);

        cells.push({
          c,
          r,
          preset: filteredPresets[index],
          key: `${c}-${r}`,
          randomOffset,
        });
      }
    }
    return cells;
  }, [
    dimensions.width,
    dimensions.height,
    offset.x,
    offset.y,
    filteredPresets,
  ]);

  // Helper function to check if a card is in viewport
  const isInViewport = (x: number, y: number) => {
    return (
      x + CARD_WIDTH > 0 &&
      x < dimensions.width &&
      y + CARD_HEIGHT > 0 &&
      y < dimensions.height
    );
  };

  return (
    <TooltipProviderWithConfig>
      <div className="w-full h-full bg-background overflow-hidden relative">
        {/* Top Right Button Group */}
        <div className="absolute top-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            <SearchButton onClick={() => setOpenCommand(true)} />

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-secondary/80 backdrop-blur-md shadow-none hover:bg-secondary"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Header / Controls */}
        <div className="absolute top-6 left-6 z-50 pointer-events-none"></div>

        {/* Infinite Canvas or Grid View */}
        {isGridView ? (
          <div className="w-full h-full overflow-y-auto pt-24 pb-24 px-8">
            {filteredPresets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Bookmark className="size-12 opacity-50" />
                <p className="text-lg font-medium">
                  {showBookmarksOnly
                    ? "No bookmarked presets yet"
                    : "No presets found"}
                </p>
                <p className="text-sm">
                  {showBookmarksOnly
                    ? "Click the bookmark icon on any preset to save it here"
                    : "Try a different search term"}
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-4 gap-16 justify-items-center mx-auto"
                style={{ width: "fit-content" }}
              >
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.name}
                    className="cursor-pointer"
                    onClick={() => onSelect(preset)}
                  >
                    <div
                      className="rounded-[40px] hover:scale-[1.02] transition-all duration-300 overflow-hidden group cursor-pointer relative shadow-md hover:shadow-lg"
                      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                    >
                      {/* Image fills entire card */}
                      {preset.image ? (
                        <img
                          src={preset.image}
                          alt={preset.name}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="text-slate-500 font-medium text-sm">
                            No Preview
                          </span>
                        </div>
                      )}

                      {/* Bookmark button - top right, visible on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(preset.name);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 z-10"
                      >
                        <Bookmark
                          className={cn(
                            "w-4 h-4 transition-colors",
                            bookmarkedPresets.has(preset.name)
                              ? "fill-white text-white"
                              : "text-white/80"
                          )}
                        />
                      </button>

                      {/* Gradient overlay - visible on hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Blur effect at bottom - visible on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mask-[linear-gradient(to_top,black_60%,transparent)]" />

                      {/* Content overlay - visible on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="text-lg font-medium text-white">
                          {preset.name}
                        </div>
                        <div className="text-sm text-white/70 mt-0.5">
                          {preset.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Bookmark className="size-12 opacity-50" />
            <p className="text-lg font-medium">
              {showBookmarksOnly
                ? "No bookmarked presets yet"
                : "No presets found"}
            </p>
            <p className="text-sm">
              {showBookmarksOnly
                ? "Click the bookmark icon on any preset to save it here"
                : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={cn(
              "w-full h-full cursor-grab active:cursor-grabbing touch-none",
              isDragging && "cursor-grabbing"
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute top-0 left-0 w-full h-full origin-top-left">
              {getVisibleCells.map(({ c, r, preset, key, randomOffset }) => {
                const x = c * CELL_WIDTH + offset.x + randomOffset.x;
                const y = r * CELL_HEIGHT + offset.y + randomOffset.y;
                const inViewport = isInViewport(x, y);

                return (
                  <AnimatedCard
                    key={key}
                    cellKey={key}
                    x={x}
                    y={y}
                    preset={preset}
                    inViewport={inViewport}
                    isDragging={isDragging}
                    cardWidth={CARD_WIDTH}
                    cardHeight={CARD_HEIGHT}
                    enableAnimation={!isInitialRender}
                    isBookmarked={bookmarkedPresets.has(preset.name)}
                    onBookmarkToggle={handleBookmarkToggle}
                    onClick={() => {
                      if (dragDistance.current < 5) {
                        onSelect(preset);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Background decoration */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Dock */}
        <Dock
          isGridView={isGridView}
          onToggleView={() => setIsGridView(!isGridView)}
          showBookmarksOnly={showBookmarksOnly}
          onToggleBookmarks={() => setShowBookmarksOnly(!showBookmarksOnly)}
          bookmarkCount={bookmarkedPresets.size}
          currentAccentColor={currentAccentColor}
          onAccentColorChange={handleAccentColorChange}
        />

        {/* Command Dialog */}
        <CommandDialog
          open={openCommand}
          onOpenChange={(open) => {
            setOpenCommand(open);
            if (!open) {
              // setSearchQuery("");
            }
          }}
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {categories.map((category) => (
              <CommandGroup key={category} heading={category}>
                {presets
                  .filter((p) => p.category === category)
                  .map((preset) => (
                    <CommandItem
                      key={preset.name}
                      onSelect={() => {
                        onSelect(preset);
                        setOpenCommand(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/40">
                        <CommandIcon className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </div>
                      <span>{preset.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {category}
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProviderWithConfig>
  );
}
