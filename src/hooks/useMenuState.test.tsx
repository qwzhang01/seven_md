import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { MenuStateProvider, useMenuState } from './useMenuState'
import React from 'react'

describe('useMenuState', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MenuStateProvider>{children}</MenuStateProvider>
  )

  it('should initialize with no open menu', () => {
    const { result } = renderHook(() => useMenuState(), { wrapper })

    expect(result.current.openMenu).toBeNull()
  })

  it('should set open menu', () => {
    const { result } = renderHook(() => useMenuState(), { wrapper })

    act(() => {
      result.current.setOpenMenu('File')
    })

    expect(result.current.openMenu).toBe('File')
  })

  it('should close menu', () => {
    const { result } = renderHook(() => useMenuState(), { wrapper })

    act(() => {
      result.current.setOpenMenu('File')
    })

    expect(result.current.openMenu).toBe('File')

    act(() => {
      result.current.closeMenu()
    })

    expect(result.current.openMenu).toBeNull()
  })

  it('should toggle menu', () => {
    const { result } = renderHook(() => useMenuState(), { wrapper })

    act(() => {
      result.current.setOpenMenu('File')
    })

    expect(result.current.openMenu).toBe('File')

    act(() => {
      result.current.setOpenMenu(null)
    })

    expect(result.current.openMenu).toBeNull()
  })

  it('should switch between menus', () => {
    const { result } = renderHook(() => useMenuState(), { wrapper })

    act(() => {
      result.current.setOpenMenu('File')
    })

    expect(result.current.openMenu).toBe('File')

    act(() => {
      result.current.setOpenMenu('Edit')
    })

    expect(result.current.openMenu).toBe('Edit')
  })

  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error')
    consoleError.mockImplementation(() => {})

    expect(() => {
      renderHook(() => useMenuState())
    }).toThrow('useMenuState must be used within MenuStateProvider')

    consoleError.mockRestore()
  })

  it('should provide context to nested components', () => {
    const TestComponent = () => {
      const { openMenu, setOpenMenu } = useMenuState()
      return (
        <div>
          <span data-testid="menu-status">{openMenu || 'none'}</span>
          <button onClick={() => setOpenMenu('File')}>Open File Menu</button>
        </div>
      )
    }

    render(
      <MenuStateProvider>
        <TestComponent />
      </MenuStateProvider>
    )

    expect(screen.getByTestId('menu-status')).toHaveTextContent('none')

    fireEvent.click(screen.getByText('Open File Menu'))

    expect(screen.getByTestId('menu-status')).toHaveTextContent('File')
  })
})
