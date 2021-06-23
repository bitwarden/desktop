import React from 'react'
import snarkdown from 'snarkdown'

import { useClient } from 'cozy-client'
import Stack from 'cozy-ui/transpiled/react/Stack'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import Icon from 'cozy-ui/transpiled/react/Icon'
import GearIcon from 'cozy-ui/transpiled/react/Icons/Gear'

import AvailablePlatforms from 'components/AvailablePlatforms'
import ChangePasswordLink from 'components/ChangePasswordLink'
import { canAuthWithOIDC } from 'helpers/oidc'

const Help = () => {
  const { t } = useI18n()
  const client = useClient()

  return (
    <Stack spacing="l">
      <p
        dangerouslySetInnerHTML={{
          __html: snarkdown(t('Help.faq'))
        }}
      />
      {canAuthWithOIDC(client) ? (
        <ChangePasswordLink
          successRoute="#/installation/configureExtension"
          cancelRoute="#/installation/configureExtension"
          Component="a"
        >
          <Icon size={12} icon={GearIcon} /> {t('UpdateCozyPassPassword')}
        </ChangePasswordLink>
      ) : null}
      <AvailablePlatforms />
    </Stack>
  )
}

export default Help
