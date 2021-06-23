import { useExtensionStatus, extensionStatuses } from './extensionStatus'
import { renderHook, act } from '@testing-library/react-hooks'
import { useFlag } from 'cozy-flags'

jest.mock('cozy-flags')

const triggerExtensionEvent = type => {
  const event = new Event(type)
  document.dispatchEvent(event)
}

describe('useExtensionStatus', () => {
  const handleExtensionStatusCheck = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()

    document.addEventListener(
      'cozy.passwordextension.check-status',
      handleExtensionStatusCheck
    )
  })

  afterEach(() => {
    jest.resetAllMocks()

    document.removeEventListener(
      'cozy.passwordextension.check-status',
      handleExtensionStatusCheck
    )
  })

  it('should ask the extension to check its status', () => {
    const { result } = renderHook(() => useExtensionStatus())

    expect(result.current).toBe(extensionStatuses.notInstalled)
    expect(handleExtensionStatusCheck).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    expect(handleExtensionStatusCheck).toHaveBeenCalledTimes(2)

    act(() => {
      triggerExtensionEvent('cozy.passwordextension.installed')
    })

    expect(result.current).toBe(extensionStatuses.installed)

    act(() => {
      triggerExtensionEvent('cozy.passwordextension.connected')
    })

    expect(result.current).toBe(extensionStatuses.connected)
  })

  describe('when the extension-check-disabled flag is enabled', () => {
    beforeEach(() => {
      useFlag.mockReturnValue(true)
    })

    it('should not send messages and tell the extension is not installed', () => {
      const { result } = renderHook(() => useExtensionStatus())

      expect(result.current).toBe(extensionStatuses.notInstalled)
      expect(handleExtensionStatusCheck).not.toHaveBeenCalled()
    })
  })
})
