import React, { useState, useCallback } from 'react'

import Button from 'cozy-ui/transpiled/react/Button'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import PasswordInput from 'cozy-ui/transpiled/react/Labs/PasswordInput'

import { useClient } from 'cozy-client'
import { useVaultClient } from 'cozy-keys-lib'
import { forceSetVaultPassphrase } from './passphrase-utils'

const SetVaultPasswordForm = ({ onSuccess }) => {
  const { t } = useI18n()

  const client = useClient()

  const vaultClient = useVaultClient()

  window.vaultClient = vaultClient

  const [values, setValues] = useState(() => ({
    passphrase: '',
    passphraseRepeat: ''
  }))

  const passphrase = values.passphrase

  const [passphraseTouched, setPassphraseTouched] = useState(false)
  const [settingPassphrase, setSettingPassphrase] = useState(false)

  const handleInputChange = useCallback(
    ev => {
      const { value: newValue, name } = ev.target
      setValues(values => ({ ...values, [name]: newValue }))
      setPassphraseTouched(true)
    },
    [setValues]
  )

  const handleSetPassphrase = useCallback(async () => {
    setSettingPassphrase(true)
    try {
      await forceSetVaultPassphrase(client, vaultClient, passphrase)
      onSuccess()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      // eslint-disable-next-line no-console
      console.warn('Error while setting passphrase')
      Alerter.error(t('SecurityStepOIDC.passphrase.error-setting-passphrase'))
      setSettingPassphrase(false)
      throw e
    }
  }, [client, vaultClient, passphrase, onSuccess, t])

  const passphraseMatch = values.passphrase === values.passphraseRepeat

  return (
    <Stack spacing="xs">
      <PasswordInput
        name="passphrase"
        autoComplete="new-password"
        id="new-passphrase"
        placeholder={t('SecurityStepOIDC.passphrase.placeholder')}
        value={values.passphrase}
        onChange={handleInputChange}
        showStrength
        error={passphraseTouched && !passphraseMatch}
      />
      <PasswordInput
        name="passphraseRepeat"
        autoComplete="new-password"
        id="new-passphrase-repeat"
        placeholder={t('SecurityStepOIDC.passphrase.confirmationPlaceholder')}
        value={values.passphraseRepeat}
        onChange={handleInputChange}
        error={passphraseTouched && !passphraseMatch}
      />
      <Button
        theme="primary"
        extension="full"
        label={t('SecurityStepOIDC.next-step')}
        disabled={!passphraseMatch || values.passphrase === ''}
        onClick={handleSetPassphrase}
        busy={settingPassphrase}
      />
    </Stack>
  )
}

export default SetVaultPasswordForm
