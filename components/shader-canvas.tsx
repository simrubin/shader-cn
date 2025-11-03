"use client"

import { useEffect, useRef } from "react"

interface ShaderCanvasProps {
  fragmentShader: string
  uniforms: Record<string, any>
  isPlaying: boolean
  onFpsUpdate: (fps: number) => void
  onError: (error: string | null) => void
}

export function ShaderCanvas({ fragmentShader, uniforms, isPlaying, onFpsUpdate, onError }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const startTimeRef = useRef(Date.now())
  const frameCountRef = useRef(0)
  const lastFpsUpdateRef = useRef(Date.now())
  const mouseRef = useRef({ x: 0.5, y: 0.5, pressed: 0 })
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) {
      onError("WebGL not supported")
      return
    }

    glRef.current = gl as WebGLRenderingContext

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height
    }

    const handleMouseDown = () => {
      mouseRef.current.pressed = 1
    }

    const handleMouseUp = () => {
      mouseRef.current.pressed = 0
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const gl = glRef.current
    if (!gl) return

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) return

    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShaderWithPrecision = `
      precision highp float;
      ${fragmentShader}
    `

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragShader) return

    gl.shaderSource(fragShader, fragmentShaderWithPrecision)
    gl.compileShader(fragShader)

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(fragShader)
      onError(error || "Shader compilation failed")
      gl.deleteShader(fragShader)
      return
    }

    onError(null)

    const program = gl.createProgram()
    if (!program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program)
      onError(error || "Program linking failed")
      return
    }

    if (programRef.current) {
      gl.deleteProgram(programRef.current)
    }
    programRef.current = program

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    startTimeRef.current = Date.now()
  }, [fragmentShader])

  useEffect(() => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program) return

    let animationFrame: number

    const render = () => {
      const currentTime = Date.now()
      const elapsed = (currentTime - startTimeRef.current) / 1000

      gl.useProgram(program)

      // Set built-in uniforms
      const timeLocation = gl.getUniformLocation(program, "u_time")
      if (timeLocation) gl.uniform1f(timeLocation, elapsed)

      const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
      }

      const mouseLocation = gl.getUniformLocation(program, "u_mouse")
      if (mouseLocation) {
        gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)
      }

      const mousePressedLocation = gl.getUniformLocation(program, "u_mousePressed")
      if (mousePressedLocation) {
        gl.uniform1f(mousePressedLocation, mouseRef.current.pressed)
      }

      // Set custom uniforms
      Object.entries(uniforms).forEach(([name, value]) => {
        const location = gl.getUniformLocation(program, name)
        if (!location) return

        if (typeof value === "number") {
          gl.uniform1f(location, value)
        } else if (typeof value === "boolean") {
          gl.uniform1f(location, value ? 1.0 : 0.0)
        } else if (Array.isArray(value)) {
          if (value.length === 2) {
            gl.uniform2f(location, value[0], value[1])
          } else if (value.length === 3) {
            gl.uniform3f(location, value[0], value[1], value[2])
          } else if (value.length === 4) {
            gl.uniform4f(location, value[0], value[1], value[2], value[3])
          }
        }
      })

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Update FPS
      frameCountRef.current++
      if (currentTime - lastFpsUpdateRef.current > 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastFpsUpdateRef.current))
        onFpsUpdate(fps)
        frameCountRef.current = 0
        lastFpsUpdateRef.current = currentTime
      }

      if (isPlaying) {
        animationFrame = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [uniforms, isPlaying])

  return <canvas ref={canvasRef} className="w-full h-full bg-black" style={{ imageRendering: "pixelated" }} />
}
