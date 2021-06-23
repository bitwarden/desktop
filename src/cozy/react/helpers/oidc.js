import flag from 'cozy-flags'
import get from 'lodash/get'

export const canAuthWithOIDC = client => {
  if (flag('passwords.oidc-auth')) {
    return true
  }
  return get(client, 'capabilities.can_auth_with_oidc')
}
