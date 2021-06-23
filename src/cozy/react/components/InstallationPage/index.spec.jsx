import React from 'react'
import { render, act } from '@testing-library/react'

import AppLike from '../../../test/lib/AppLike'
import { BitwardenSettingsContext } from '../../bitwarden-settings'

import InstallationPage from '.'
import { isWarningStep } from './step-test-utils'

describe('installation page', () => {
  describe('hint warning', () => {
    const setup = async ({ vaultConfigured }) => {
      const bitwardenSettings = { extension_installed: vaultConfigured }
      let rendered
      await act(async () => {
        rendered = render(
          <BitwardenSettingsContext.Provider value={bitwardenSettings}>
            <AppLike>
              <InstallationPage />
            </AppLike>
          </BitwardenSettingsContext.Provider>
        )
      })
      return rendered
    }

    it('should not be shown if the vault is not configured', async () => {
      const { queryByText } = await setup({ vaultConfigured: false })
      const node = queryByText('Leave hint')
      expect(isWarningStep(node)).toBe(false)
    })

    it('should be shown if the vault is not configured', async () => {
      const { queryByText } = await setup({ vaultConfigured: true })
      const node = queryByText('Leave hint')
      expect(isWarningStep(node)).toBe(true)
    })
  })
})
