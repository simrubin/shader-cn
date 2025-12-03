"use client";

import { useEffect, useRef, useState } from "react";
import "./liquid-slider.css";

interface LiquidSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  compact?: boolean;
  showIcons?: boolean;
}

export function LiquidSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  compact = false,
  showIcons = false,
}: LiquidSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [delta, setDelta] = useState(0);
  const [bounce, setBounce] = useState<"top" | "bottom" | null>(null);
  const deltaCap = 5;

  useEffect(() => {
    if (!inputRef.current || !sliderRef.current) return;

    const input = inputRef.current;
    const slider = sliderRef.current;

    const sync = (newValue?: number) => {
      const currentValue =
        newValue !== undefined ? newValue : Number(input.value);
      const val = (currentValue - min) / (max - min);
      const percentComplete = val * 100;

      // Calculate liquid value based on keyframe mapping
      let liquidValue;
      if (percentComplete <= 10) {
        liquidValue = (percentComplete / 10) * 60;
      } else if (percentComplete <= 90) {
        liquidValue = 60;
      } else {
        liquidValue = 60 + ((percentComplete - 90) / 10) * 40;
      }

      slider.style.setProperty(
        "--slider-complete",
        Math.round(percentComplete).toString()
      );
      slider.style.setProperty(
        "--slider-liquid",
        Math.round(liquidValue).toString()
      );
    };

    const handleInput = () => {
      const newValue = Number(input.value);
      sync(newValue);
      onChange(newValue);

      // Handle bounce animations at extremes
      if (newValue === max && bounce !== "top") {
        setBounce("top");
        setTimeout(() => setBounce(null), 320);
      } else if (newValue === min && bounce !== "bottom") {
        setBounce("bottom");
        setTimeout(() => setBounce(null), 320);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsActive(true);
      const { left, width } = input.getBoundingClientRect();
      const range = max - min;
      const ratio = (e.clientX - left) / width;
      const val = min + Math.floor(range * ratio);
      input.value = val.toString();
      const clampedValue = Math.max(min, Math.min(max, val));
      sync(clampedValue);
      onChange(clampedValue);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const movementDelta = Math.min(Math.abs(moveEvent.movementX), deltaCap);
        setDelta(movementDelta);
        slider.style.setProperty("--delta", movementDelta.toString());
      };

      const handlePointerUp = () => {
        setIsActive(false);
        setDelta(0);
        slider.style.setProperty("--delta", "0");
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    };

    // Set initial value
    input.value = value.toString();
    sync(value);

    input.addEventListener("input", handleInput);
    input.addEventListener("pointerdown", handlePointerDown);

    return () => {
      input.removeEventListener("input", handleInput);
      input.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [bounce, deltaCap, value, min, max, onChange]);

  // Update slider when value changes externally
  useEffect(() => {
    if (inputRef.current && sliderRef.current && !isActive) {
      inputRef.current.value = value.toString();
      const val = (value - min) / (max - min);
      const percentComplete = val * 100;

      let liquidValue;
      if (percentComplete <= 10) {
        liquidValue = (percentComplete / 10) * 60;
      } else if (percentComplete <= 90) {
        liquidValue = 60;
      } else {
        liquidValue = 60 + ((percentComplete - 90) / 10) * 40;
      }

      sliderRef.current.style.setProperty(
        "--slider-complete",
        Math.round(percentComplete).toString()
      );
      sliderRef.current.style.setProperty(
        "--slider-liquid",
        Math.round(liquidValue).toString()
      );
    }
  }, [value, min, max, isActive]);

  return (
    <div
      className="relative"
      data-bounce={bounce || undefined}
      data-active={isActive}
      style={
        compact
          ? {
              // @ts-ignore
              "--slider-width": "220",
              "--slider-height": "28",
            }
          : undefined
      }
    >
      <div
        ref={sliderRef}
        className={`slider ${compact ? "slider--compact" : ""}`}
        data-sliding={isActive}
        style={
          compact
            ? {
                // @ts-ignore
                "--width": "220",
                "--height": "28",
              }
            : undefined
        }
      >
        {/* Sun Icon */}
        {showIcons && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="slider-icon slider-icon-left"
          >
            <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM12.95 4.11a.75.75 0 1 0-1.06-1.06l-1.062 1.06a.75.75 0 0 0 1.061 1.062l1.06-1.061ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM11.89 12.95a.75.75 0 0 0 1.06-1.06l-1.06-1.062a.75.75 0 0 0-1.062 1.061l1.061 1.06ZM8 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12ZM5.172 11.89a.75.75 0 0 0-1.061-1.062L3.05 11.89a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM4 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 4 8ZM4.11 5.172A.75.75 0 0 0 5.173 4.11L4.11 3.05a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" />
          </svg>
        )}

        {/* Moon Icon */}
        {showIcons && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="slider-icon slider-icon-right"
          >
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
        )}

        <div className="knockout">
          <div className="slider__fill"></div>
          <div className="indicator indicator--masked">
            <div className="mask"></div>
          </div>
        </div>

        <div className="slider__track">
          <label htmlFor="slider" className="sr-only">
            Slider
          </label>
          <input
            ref={inputRef}
            type="range"
            id="slider"
            min={min}
            max={max}
            step={step}
            defaultValue={value}
            tabIndex={0}
          />
          <div className="indicator__liquid">
            <div className="shadow"></div>
            <div className="wrapper">
              <div className="liquids liquids--track">
                <div className="liquid__shadow"></div>
                <div className="liquid__track"></div>
              </div>
              <div className="liquids liquids--fill">
                <div className="liquid__shadow"></div>
                <div className="liquid__track"></div>
              </div>
            </div>
            <div className="cover"></div>
          </div>
        </div>
      </div>

      <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Goo filter with displacement for liquid effect */}
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              result="blur"
              in="SourceGraphic"
              stdDeviation="13"
            />
            <feColorMatrix
              result="matrix"
              in="blur"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 16 -10
              "
              type="matrix"
            />
            <feComposite
              result="composite"
              in="matrix"
              operator="atop"
              in2="SourceGraphic"
            />
          </filter>

          <filter
            id="liquid-active"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.001 0.001"
              numOctaves="1"
              result="turbulence"
              seed="1"
            >
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.001 0.001;0.0012 0.0012;0.001 0.001"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="0.04"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.5"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 16 -10
              "
              result="goo"
            />
          </filter>

          <filter id="knockout" colorInterpolationFilters="sRGB">
            <feColorMatrix
              result="knocked"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -1 -1 -1 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="3" intercept="-1" />
              <feFuncG type="linear" slope="3" intercept="-1" />
              <feFuncB type="linear" slope="3" intercept="-1" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncG type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncB type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
            </feComponentTransfer>
          </filter>

          <filter id="remove-black" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -255 -255 -255 0 1"
              result="black-pixels"
            />
            <feMorphology
              in="black-pixels"
              operator="dilate"
              radius="0.5"
              result="smoothed"
            />
            <feComposite in="SourceGraphic" in2="smoothed" operator="out" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
