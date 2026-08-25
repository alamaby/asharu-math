import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NavigationProvider, useNavigation, type Screen } from '../src/state/NavigationContext'

function useNavigationWithoutProvider() {
  return useNavigation()
}

describe('NavigationContext', () => {
  it('useNavigation di luar provider melempar error', () => {
    expect(() => renderHook(useNavigationWithoutProvider)).toThrow(
      'useNavigation harus dipakai di dalam NavigationProvider',
    )
  })

  it('layar awal home tanpa kemampuan back', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    })
    expect(result.current.screen.name).toBe('home')
    expect(result.current.canBack).toBe(false)
  })

  it('navigate mendorong stack dan back menurunkannya', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    })
    act(() => result.current.navigate({ name: 'settings' }))
    expect(result.current.screen.name).toBe('settings')
    expect(result.current.canBack).toBe(true)
    act(() => result.current.back())
    expect(result.current.screen.name).toBe('home')
    expect(result.current.canBack).toBe(false)
  })

  it('back pada layar akar tidak mengubah apa pun', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    })
    act(() => result.current.back())
    expect(result.current.screen.name).toBe('home')
  })

  it('goToTab mereset stack dalam menjadi [home, tab]', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    })
    act(() => result.current.navigate({ name: 'learn', levelId: 'level-1' }))
    act(() => result.current.navigate({ name: 'achievements' }))
    act(() => result.current.goToTab('practice'))
    expect(result.current.screen.name).toBe('practice')
    expect(result.current.canBack).toBe(true)
  })

  it('layar learn membawa levelId', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    })
    const target: Screen = { name: 'learn', levelId: 'level-5' }
    act(() => result.current.navigate(target))
    expect(result.current.screen).toEqual(target)
  })
})
