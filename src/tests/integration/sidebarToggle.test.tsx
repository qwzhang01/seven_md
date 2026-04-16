import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'

// Test component that simulates sidebar toggle
function SidebarToggleTestComponent() {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(250)

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev)
  }

  const increaseWidth = () => {
    setSidebarWidth(prev => Math.min(prev + 50, 500))
  }

  const decreaseWidth = () => {
    setSidebarWidth(prev => Math.max(prev - 50, 150))
  }

  return (
    <div style={{ display: 'flex' }}>
      <aside 
        data-testid="sidebar"
        style={{ 
          width: sidebarWidth,
          display: sidebarVisible ? 'block' : 'none'
        }}
      >
        <span data-testid="sidebar-width">{sidebarWidth}</span>
      </aside>
      <main data-testid="main-content">
        <button onClick={toggleSidebar} data-testid="toggle-btn">
          {sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        </button>
        <button onClick={increaseWidth} data-testid="increase-width-btn">Increase Width</button>
        <button onClick={decreaseWidth} data-testid="decrease-width-btn">Decrease Width</button>
      </main>
    </div>
  )
}

describe('Sidebar Toggle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows sidebar by default', () => {
    render(<SidebarToggleTestComponent />)
    
    expect(screen.getByTestId('sidebar')).toBeVisible()
    expect(screen.getByTestId('toggle-btn')).toHaveTextContent('Hide Sidebar')
  })

  it('hides sidebar when toggle button is clicked', () => {
    render(<SidebarToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    
    expect(screen.getByTestId('sidebar')).not.toBeVisible()
    expect(screen.getByTestId('toggle-btn')).toHaveTextContent('Show Sidebar')
  })

  it('shows sidebar again when toggle is clicked twice', () => {
    render(<SidebarToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('sidebar')).not.toBeVisible()
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('sidebar')).toBeVisible()
  })

  it('has default width of 250px', () => {
    render(<SidebarToggleTestComponent />)
    
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('250')
  })

  it('increases sidebar width', () => {
    render(<SidebarToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('increase-width-btn'))
    
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('300')
  })

  it('decreases sidebar width', () => {
    render(<SidebarToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('decrease-width-btn'))
    
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('200')
  })

  it('has max width limit of 500px', () => {
    render(<SidebarToggleTestComponent />)
    
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByTestId('increase-width-btn'))
    }
    
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('500')
  })

  it('has min width limit of 150px', () => {
    render(<SidebarToggleTestComponent />)
    
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByTestId('decrease-width-btn'))
    }
    
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('150')
  })

  it('maintains width when toggling visibility', () => {
    render(<SidebarToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('increase-width-btn'))
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('300')
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('sidebar')).not.toBeVisible()
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('sidebar')).toBeVisible()
    expect(screen.getByTestId('sidebar-width')).toHaveTextContent('300')
  })
})
