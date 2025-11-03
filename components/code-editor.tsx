"use client"

import { useEffect, useRef } from "react"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  error: string | null
}

export function CodeEditor({ value, onChange, error }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [value])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground">Fragment Shader</h2>
        <p className="text-xs text-muted-foreground">GLSL Code Editor</p>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-mono">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-auto p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-full bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none"
          spellCheck={false}
          style={{
            tabSize: 2,
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>
    </div>
  )
}
