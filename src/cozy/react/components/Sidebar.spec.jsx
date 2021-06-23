'use strict'

/* eslint-env jest */

import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import AppLike from '../../test/lib/AppLike'
import { Sidebar } from 'components/Sidebar'
import { BitwardenSettingsContext } from '../bitwarden-settings'

describe('Sidebar component', () => {
  const setup = ({ extension_installed }) => {
    const bitwardenSettings = { extension_installed }
    const rendered = render(
      <BitwardenSettingsContext.Provider value={bitwardenSettings}>
        <AppLike>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AppLike>
      </BitwardenSettingsContext.Provider>
    )
    return { rendered }
  }

  it('should be rendered correctly when vault has not been configured', () => {
    const {
      rendered: { queryByText }
    } = setup({ extension_installed: false })
    expect(queryByText(/installation/i)).toBe(null)
  })

  it('should be rendered correctly when vault has been configured', () => {
    const {
      rendered: { getByText }
    } = setup({ extension_installed: true })
    expect(getByText(/installation/i)).toBeDefined()
    expect(getByText(/import/i)).toBeDefined()
  })
})
