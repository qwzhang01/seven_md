/**
 * CSS 作用域包装器
 * 给 CSS 选择器添加作用域前缀
 */

/**
 * 给 CSS 添加作用域前缀
 */
export function wrapCSSWithScope(css: string, scope: string = '#wechat-preview'): string {
  return css.replace(
    /([^{}]+)\{([^}]*)\}/g,
    (match, selectors, properties) => {
      const trimmedSelectors = selectors.trim()
      if (trimmedSelectors.startsWith('@') || trimmedSelectors.startsWith(':root')) {
        return match
      }

      const wrappedSelectors = selectors
        .split(',')
        .map((selector: string) => {
          const trimmed = selector.trim()

          if (trimmed.startsWith(scope)) return trimmed
          if (!trimmed) return trimmed

          return `${scope} ${trimmed}`
        })
        .filter(Boolean)
        .join(',\n')

      return `${wrappedSelectors} {${properties}}`
    },
  )
}
