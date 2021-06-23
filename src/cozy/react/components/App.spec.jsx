import React from 'react'
import App from './App'
import { render } from '@testing-library/react'
import {
  useExtensionStatus,
  extensionStatuses
} from '../helpers/extensionStatus.js'
import { act } from 'react-dom/test-utils'
import AppLike from '../../test/lib/AppLike'
import { fetchHintExists } from '../hint'

jest.mock('../hint')

fetchHintExists.mockResolvedValue({ hint: 'My favorite movie' })

// This should not be required since cozy-ui v29.9.1
// (see https://github.com/cozy/cozy-ui/releases/tag/v29.9.1)
jest.mock('cozy-ui/transpiled/react/utils/color', () => ({
  getCssVariableValue: () => '#fff'
}))

jest.mock('detect-browser')
jest.mock('cozy-ui/transpiled/react/helpers/withBreakpoints')
jest.mock('../helpers/extensionStatus')

describe('App', () => {
  afterEach(() => {
    useExtensionStatus.mockReset()
  })

  describe('when extension is not installed', () => {
    beforeEach(() => {
      useExtensionStatus.mockReturnValue(extensionStatuses.notInstalled)
    })

    it('should render PresentationStep by default', async () => {
      let rendered
      await act(async () => {
        rendered = render(
          <AppLike>
            <App />
          </AppLike>
        )
      })

      expect(rendered.getByText('Stop losing your passwords')).toBeDefined()
      expect(rendered.getByText(/let's go/i)).toBeDefined()
    })
  })
})
