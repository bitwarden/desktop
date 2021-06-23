import React from 'react'
import {
  useExtensionStatus,
  extensionStatuses
} from '../../helpers/extensionStatus'
import { render } from '@testing-library/react'
import ConfigureExtensionStep from '../ConfigureExtensionStep'
import AppLike from '../../../test/lib/AppLike'

jest.mock('../../helpers/extensionStatus')

const setup = () => {
  return render(
    <AppLike>
      <ConfigureExtensionStep />
    </AppLike>
  )
}

describe('when extension is installed', () => {
  beforeEach(() => {
    useExtensionStatus.mockReturnValue(extensionStatuses.installed)
  })

  it('should show InstalledStep', async () => {
    const { getByText } = setup()
    expect(getByText("It's almost finished!")).toBeDefined()
  })
})

describe('when extension is connected', () => {
  beforeEach(() => {
    useExtensionStatus.mockReturnValue(extensionStatuses.connected)
  })

  it('should show ConnectedStep', async () => {
    const { getByText } = setup()
    expect(getByText('Your password manager is configured!')).toBeDefined()
  })
})
