"use client";

import { useState, useRef } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Configurable options
  const [speed, setSpeed] = useState(0.3);
  const [showWireframe, setShowWireframe] = useState(true);
  const [grain, setGrain] = useState(0.02);
  const [distortion, setDistortion] = useState(0.2);
  const [swirl, setSwirl] = useState(0.1);
  
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('npm i @paper-design/shaders-react');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Dark theme colors similar to 21st.dev
  const darkColors = ["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"];
  const wireframeColors = ["#000000", "#ffffff", "#06b6d4", "#f97316", "#000000"];

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Base Mesh Gradient */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={darkColors}
        speed={speed}
        distortion={distortion}
        swirl={swirl}
        grainOverlay={grain}
      />

      {/* Wireframe overlay */}
      {showWireframe && (
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.5 }}
          colors={wireframeColors}
          speed={speed * 0.7}
          wireframe
          distortion={distortion * 0.8}
          swirl={swirl * 0.5}
        />
      )}

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="size-10 text-white group-hover:drop-shadow-lg transition-all duration-300"
          >
            <path d="M15 85V15h12l18 35 18-35h12v70h-12V35L45 70h-10L17 35v50H15z" />
          </svg>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Features
          </a>
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Pricing
          </a>
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Docs
          </a>
        </nav>

        {/* Login Button */}
        <button className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center">
          Login
        </button>
      </header>

      {/* Main Content */}
      <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
        <div className="text-left">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{ filter: "url(#glass-effect)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              ✨ Paper Design Shaders
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-white/90 text-4xl md:text-5xl lg:text-6xl mb-2 tracking-wider"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #f97316 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
            >
              Beautiful
            </motion.span>
            <span className="block font-black text-white drop-shadow-2xl">Mesh</span>
            <span className="block font-light text-white/80 italic">Gradients</span>
          </motion.h1>

          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Create stunning visual experiences with flowing mesh gradients powered by 
            @paper-design/shaders-react. Interactive, performant, and beautiful.
          </motion.p>

          <motion.div
            className="flex items-center gap-4 flex-wrap mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-semibold text-sm transition-all duration-300 hover:from-cyan-400 hover:to-orange-400 cursor-pointer shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              className="px-8 py-3 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Docs
            </motion.button>
          </motion.div>

          {/* Install Command */}
          <motion.div
            className="flex items-center gap-2 font-mono text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-cyan-400">$</span>
            <span>npm i @paper-design/shaders-react</span>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </motion.div>
        </div>
      </main>

      {/* Controls Panel */}
      <div className="absolute bottom-8 right-8 z-20 bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-3 min-w-[220px]">
        {/* Speed Control */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 flex justify-between">
            <span>Speed</span>
            <span>{speed.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Grain Control */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 flex justify-between">
            <span>Grain</span>
            <span>{grain.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={grain}
            onChange={(e) => setGrain(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Distortion Control */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 flex justify-between">
            <span>Distortion</span>
            <span>{distortion.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={distortion}
            onChange={(e) => setDistortion(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Swirl Control */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 flex justify-between">
            <span>Swirl</span>
            <span>{swirl.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={swirl}
            onChange={(e) => setSwirl(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Wireframe Toggle */}
        <button
          onClick={() => setShowWireframe(!showWireframe)}
          className={`w-full px-3 py-1.5 rounded-lg text-xs transition-colors ${
            showWireframe
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-white/5 text-white/50 border border-white/10"
          }`}
        >
          Wireframe {showWireframe ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
