export interface ShaderUniform {
  type: "float" | "vec2" | "vec3" | "vec4" | "bool" | "int"
  defaultValue: any
  min: number
  max: number
  step: number
  isColor: boolean
}

export function parseShaderUniforms(shaderCode: string): Record<string, ShaderUniform> {
  const uniforms: Record<string, ShaderUniform> = {}

  // Match uniform declarations with optional comments
  const uniformRegex = /uniform\s+(float|vec2|vec3|vec4|bool|int)\s+(\w+)\s*;(?:\s*\/\/\s*(.*))?/g

  let match
  while ((match = uniformRegex.exec(shaderCode)) !== null) {
    const [, type, name, comment] = match

    // Skip built-in uniforms
    if (name.startsWith("u_time") || name.startsWith("u_resolution") || name.startsWith("u_mouse")) {
      continue
    }

    const uniform: ShaderUniform = {
      type: type as any,
      defaultValue: getDefaultValue(type, comment),
      min: getMin(type, comment),
      max: getMax(type, comment),
      step: getStep(type, comment),
      isColor: isColorUniform(name, comment),
    }

    uniforms[name] = uniform
  }

  return uniforms
}

function getDefaultValue(type: string, comment?: string): any {
  // Try to parse default from comment
  if (comment) {
    const defaultMatch = comment.match(/default[:\s]+([0-9.,[\]\s]+)/i)
    if (defaultMatch) {
      const value = defaultMatch[1].trim()
      if (type === "float" || type === "int") {
        return Number.parseFloat(value)
      } else if (type === "bool") {
        return value === "true" || value === "1"
      } else if (type.startsWith("vec")) {
        const nums = value.match(/[0-9.]+/g)
        return nums ? nums.map(Number.parseFloat) : getTypeDefault(type)
      }
    }
  }

  return getTypeDefault(type)
}

function getTypeDefault(type: string): any {
  switch (type) {
    case "float":
    case "int":
      return 1.0
    case "vec2":
      return [0.5, 0.5]
    case "vec3":
      return [0.5, 0.5, 0.5]
    case "vec4":
      return [0.5, 0.5, 0.5, 1.0]
    case "bool":
      return false
    default:
      return 0
  }
}

function getMin(type: string, comment?: string): number {
  if (comment) {
    const minMatch = comment.match(/min[:\s]+([0-9.-]+)/i)
    if (minMatch) return Number.parseFloat(minMatch[1])
  }
  return type === "float" || type === "int" ? 0 : 0
}

function getMax(type: string, comment?: string): number {
  if (comment) {
    const maxMatch = comment.match(/max[:\s]+([0-9.-]+)/i)
    if (maxMatch) return Number.parseFloat(maxMatch[1])
  }
  return type === "float" || type === "int" ? 10 : 1
}

function getStep(type: string, comment?: string): number {
  if (comment) {
    const stepMatch = comment.match(/step[:\s]+([0-9.-]+)/i)
    if (stepMatch) return Number.parseFloat(stepMatch[1])
  }
  return type === "float" ? 0.01 : type === "int" ? 1 : 0.01
}

function isColorUniform(name: string, comment?: string): boolean {
  const colorKeywords = ["color", "colour", "rgb"]
  const nameLower = name.toLowerCase()
  const commentLower = comment?.toLowerCase() || ""

  return colorKeywords.some((keyword) => nameLower.includes(keyword) || commentLower.includes(keyword))
}
