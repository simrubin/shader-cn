"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  Copy,
  Check,
  Terminal,
  CodeXml,
  Package,
  Sparkles,
} from "lucide-react";

interface CodePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  shaderCode: string;
  shaderName: string;
  uniformValues: Record<string, any>;
  renderMode: "canvas" | "mesh" | "fullscreen";
}

type TabType = "integrate" | "manual";

// Code syntax highlighting (simple version)
function CodeBlock({
  code,
  language = "tsx",
  title,
  onCopy,
}: {
  code: string;
  language?: string;
  title?: string;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
      {title && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="p-3 overflow-x-auto">
        <code className="text-xs font-mono text-foreground/90 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// Step component for the manual guide
function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {number}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="ml-9 space-y-3">{children}</div>
    </div>
  );
}

export function CodePanel({
  isOpen,
  onToggle,
  shaderCode,
  shaderName,
  uniformValues,
  renderMode,
}: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("integrate");

  // Generate the component code based on current uniform values
  const componentCode = useMemo(() => {
    const uniformEntries = Object.entries(uniformValues)
      .filter(([name]) => !["u_time", "u_resolution", "u_mouse", "u_mousePressed"].includes(name))
      .map(([name, value]) => {
        if (Array.isArray(value)) {
          return `  ${name}: [${value.join(", ")}],`;
        }
        if (typeof value === "object" && value?.type === "texture") {
          return `  // ${name}: Upload your own image`;
        }
        return `  ${name}: ${typeof value === "number" ? value.toFixed(3) : value},`;
      })
      .join("\n");

    return `import { ShaderCanvas } from "@/components/shader-canvas";

// ${shaderName} Shader
export function ${shaderName.replace(/[^a-zA-Z0-9]/g, "")}Shader() {
  const uniforms = {
${uniformEntries}
  };

  return (
    <div className="w-full h-screen">
      <ShaderCanvas
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        isPlaying={true}
      />
    </div>
  );
}`;
  }, [shaderName, uniformValues]);

  // Generate the shader prompt for AI integration
  const integrationPrompt = useMemo(() => {
    const uniformEntries = Object.entries(uniformValues)
      .filter(([name]) => !["u_time", "u_resolution", "u_mouse", "u_mousePressed"].includes(name))
      .filter(([_, value]) => !(typeof value === "object" && value?.type === "texture"))
      .map(([name, value]) => {
        const formattedValue = Array.isArray(value)
          ? `[${value.map((v: number) => v.toFixed(3)).join(", ")}]`
          : typeof value === "number"
          ? value.toFixed(3)
          : String(value);
        return `${name}: ${formattedValue}`;
      })
      .join(", ");

    return `Add a WebGL shader background to my project using the "${shaderName}" shader with these settings: ${uniformEntries}. Use the ShaderCanvas component with the fragmentShader code and these uniform values.`;
  }, [shaderName, uniformValues]);

  // Dependency install commands
  const dependencies = {
    npm: "npm install three @react-three/fiber @react-three/drei",
    pnpm: "pnpm add three @react-three/fiber @react-three/drei",
    yarn: "yarn add three @react-three/fiber @react-three/drei",
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-50 p-2.5 rounded-xl",
          "bg-card/90 backdrop-blur-md border border-border shadow-lg",
          "hover:bg-card transition-colors",
          isOpen && "opacity-0 pointer-events-none"
        )}
        title="Open Code Panel"
      >
        <CodeXml className="size-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-96 z-50 flex flex-col bg-card/80 backdrop-blur-xl border-r border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">Code Integration</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{shaderName}</p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("integrate")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
                  activeTab === "integrate"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Quick Integration
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
                  activeTab === "manual"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="h-3.5 w-3.5" />
                Step-by-Step
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "integrate" ? (
                <div className="space-y-6">
                  {/* AI Integration Prompt */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">AI Integration Prompt</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Copy this prompt and paste it into your AI assistant (Cursor, Copilot, etc.) to add this shader to your project.
                    </p>
                    <CodeBlock
                      code={integrationPrompt}
                      title="Integration Prompt"
                      language="text"
                    />
                  </div>

                  {/* Current Configuration */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Current Configuration</h3>
                    <p className="text-xs text-muted-foreground">
                      These are your current shader settings. The prompt above includes these values.
                    </p>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="space-y-2">
                        {Object.entries(uniformValues)
                          .filter(([name]) => !["u_time", "u_resolution", "u_mouse", "u_mousePressed"].includes(name))
                          .filter(([_, value]) => !(typeof value === "object" && value?.type === "texture"))
                          .map(([name, value]) => (
                            <div key={name} className="flex justify-between text-xs">
                              <span className="text-muted-foreground font-mono">{name}</span>
                              <span className="font-mono">
                                {Array.isArray(value)
                                  ? `[${value.map((v: number) => v.toFixed(2)).join(", ")}]`
                                  : typeof value === "number"
                                  ? value.toFixed(2)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Step 1: Install Dependencies */}
                  <Step number={1} title="Install Dependencies">
                    <p className="text-xs text-muted-foreground">
                      If using R3F mode, install Three.js and React Three Fiber:
                    </p>
                    <CodeBlock code={dependencies.npm} title="npm" language="bash" />
                    <CodeBlock code={dependencies.pnpm} title="pnpm" language="bash" />
                  </Step>

                  {/* Step 2: Create ShaderCanvas Component */}
                  <Step number={2} title="Create ShaderCanvas Component">
                    <p className="text-xs text-muted-foreground">
                      Create a new file at <code className="bg-muted px-1 rounded">components/shader-canvas.tsx</code>:
                    </p>
                    <CodeBlock
                      code={`// See the full ShaderCanvas component code at:
// https://github.com/your-repo/shader-cn

// Or copy from your project's components/shader-canvas.tsx`}
                      title="shader-canvas.tsx"
                      language="tsx"
                    />
                  </Step>

                  {/* Step 3: Add Shader Code */}
                  <Step number={3} title="Add Shader Code">
                    <p className="text-xs text-muted-foreground">
                      Create a file for your shader code:
                    </p>
                    <CodeBlock
                      code={`// shaders/${shaderName.toLowerCase().replace(/\s+/g, "-")}.ts
export const fragmentShader = \`
${shaderCode.slice(0, 500)}${shaderCode.length > 500 ? "\n// ... (full shader code)" : ""}
\`;`}
                      title="Shader File"
                      language="typescript"
                    />
                  </Step>

                  {/* Step 4: Use in Your Project */}
                  <Step number={4} title="Use in Your Project">
                    <p className="text-xs text-muted-foreground">
                      Import and use the shader component:
                    </p>
                    <CodeBlock code={componentCode} title="Usage" language="tsx" />
                  </Step>

                  {/* Full Shader Code */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold">Full Shader Code</h3>
                    <p className="text-xs text-muted-foreground">
                      Copy the complete fragment shader:
                    </p>
                    <CodeBlock code={shaderCode} title="Fragment Shader (GLSL)" language="glsl" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

