import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'
import { ActivityBar } from '../../components/activitybar-v2/ActivityBar'
import { useUIStore } from '../../stores'

function resetUI() {
  useUIStore.setState({
    sidebarVisible: true,
    activeSidebarPanel: 'explorer',
  } as any)
}

describe('ActivityBar', () => {
  beforeEach(() => act(() => resetUI()))

  it('渲染 4 个活动栏图标', () => {
    render(<ActivityBar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('渲染资源管理器按钮', () => {
    render(<ActivityBar />)
    expect(screen.getByLabelText(/资源管理器/i)).toBeInTheDocument()
  })

  it('点击切换侧边栏面板', () => {
    render(<ActivityBar />)
    const searchBtn = screen.getByLabelText(/搜索/i)
    fireEvent.click(searchBtn)
    expect(useUIStore.getState().activeSidebarPanel).toBe('search')
  })

  it('点击已激活图标，收起侧边栏', () => {
    render(<ActivityBar />)
    const explorerBtn = screen.getByLabelText(/资源管理器/i)
    // 已经是 explorer，再点一次收起
    fireEvent.click(explorerBtn)
    expect(useUIStore.getState().sidebarVisible).toBe(false)
  })

  it('点击不同图标后侧边栏保持展开', () => {
    render(<ActivityBar />)
    const outlineBtn = screen.getByLabelText(/大纲/i)
    fireEvent.click(outlineBtn)
    expect(useUIStore.getState().sidebarVisible).toBe(true)
    expect(useUIStore.getState().activeSidebarPanel).toBe('outline')
  })
})
