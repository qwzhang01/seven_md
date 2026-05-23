/**
 * CSS 变量生成工具
 */

export interface CSSVariableConfig {
  primaryColor: string
  fontFamily: string
  fontSize: string
}

/**
 * 生成 CSS 变量样式
 */
export function generateCSSVariables(config: CSSVariableConfig): string {
  return `
:root {
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};
  --foreground: 0 0% 9%;
  --blockquote-background: rgba(0, 0, 0, 0.03);
}
  `.trim()
}
