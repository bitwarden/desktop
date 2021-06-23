import React from 'react'
import CozyClient from 'cozy-client'
import { render } from '@testing-library/react'
import Help from './Help'
import AppLike from '../../test/lib/AppLike'

describe('Help', () => {
  const setup = ({ clientAttributes } = {}) => {
    const client = new CozyClient({
      uri: 'https://test.mycozy.cloud'
    })
    Object.assign(client, clientAttributes)
    const root = render(
      <AppLike client={client}>
        <Help />
      </AppLike>
    )
    return { root }
  }

  it('should show help', () => {
    const { root } = setup()
    expect(root.getByText("I can't connect")).toBeTruthy()
    expect(root.queryByText('Update Cozy Pass password')).toBeFalsy()
  })

  it('should show cozy pass change password link only if oidc client', () => {
    const { root } = setup({
      clientAttributes: {
        capabilities: {
          can_auth_with_oidc: true
        }
      }
    })
    expect(root.getByText('Update Cozy Pass password')).toBeTruthy()
  })
})
