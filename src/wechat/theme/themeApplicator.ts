/**
 * 主题应用工具（纯函数，不操作 DOM）
 * 将主题 CSS 组合并返回完整 CSS 字符串
 */

import type { ThemeName } from '../theme-css'
import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, themeMap } from '../theme-css'
import { processCSS } from './cssProcessor'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCSSVariables } from './cssVariables'

export interface ThemeConfig {
  themeName: ThemeName
  primaryColor: string
  fontFamily: string
  fontSize: string
  customCSS?: string
}

/**
 * 构建完整的主题 CSS（纯函数，不注入 DOM）
 * @param config - 主题配置
 * @returns 处理后的完整 CSS 字符串
 */
export function buildThemeCSS(config: ThemeConfig): string {
  // 1. 生成 CSS 变量
  const variablesCSS = generateCSSVariables({
    primaryColor: config.primaryColor,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
  })

  // 2. 构建主题 CSS（默认主题作为基础 + 特定主题叠加）
  let themeCSS = themeMap.default
  if (config.themeName !== 'default') {
    const specificThemeCSS = themeMap[config.themeName]
    if (specificThemeCSS) {
      themeCSS = `${themeCSS}\n\n${specificThemeCSS}`
    }
  }

  // 3. 添加作用域
  const scopedThemeCSS = wrapCSSWithScope(themeCSS, '#wechat-preview')

  // 4. 处理用户自定义 CSS
  const scopedCustomCSS = config.customCSS
    ? wrapCSSWithScope(config.customCSS, '#wechat-preview')
    : ''

  // 5. 拼接完整 CSS
  let mergedCSS = [
    variablesCSS,
    baseCSSContent,
    scopedThemeCSS,
    scopedCustomCSS,
  ].filter(Boolean).join('\n\n')

  // 6. 解析 CSS 变量（将 var(--xxx) 替换为实际值）
  mergedCSS = processCSS(mergedCSS)

  return mergedCSS
}
