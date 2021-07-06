import React, { useState } from 'react'
import Button from 'cozy-ui/transpiled/react/Button'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import Input from 'cozy-ui/transpiled/react/Input'
import { withClient, useClient } from 'cozy-client'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import Wrapper from 'cozy/react/components/Wrapper'
import NarrowContent from 'cozy-ui/transpiled/react/NarrowContent'
import passwordClueIcon from 'cozy/react/assets/password-clue.svg'
import { MainTitle, Text } from 'cozy-ui/transpiled/react/Text'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import VerticallyCentered from './VerticallyCentered'
import BarTitle from 'cozy/react/BarTitle'

const DumbHintStep = props => {
  const client = useClient()
  const { goToNextStep } = props
  const { t } = useI18n()
  const [hint, setHint] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()

    setSaving(true)

    try {
      await client.getStackClient().fetchJSON('PUT', '/settings/hint', {
        hint
      })

      goToNextStep()
    } catch (err) {
      Alerter.error(t('HintStep.error'))

      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <VerticallyCentered>
      <BarTitle>{t('Nav.installation')}</BarTitle>
      <Wrapper>
        <NarrowContent>
          <Stack spacing="xxl" tag="form" onSubmit={handleSubmit}>
            <Stack spacing="m">
              <img src={passwordClueIcon} alt="" height={137} />
              <MainTitle className="u-mt-1">{t('HintStep.title')}</MainTitle>
              <Text>
                {props.hasHint === null ? (
                  <Spinner size="small" />
                ) : props.hasHint === false ? (
                  t('HintStep.please-configure-hint')
                ) : (
                  t('HintStep.hint-configured')
                )}
              </Text>
            </Stack>
            <Stack spacing="m">
              <Input
                placeholder={t('HintStep.placeholder')}
                value={hint}
                onChange={e => setHint(e.target.value)}
              />
              <Text>{t('HintStep.description')}</Text>
            </Stack>
            <Button
              label={t('HintStep.submit')}
              disabled={saving || hint === ''}
              busy={saving}
              extension="full"
              className="u-mt-2"
            />
            {props.hasHint ? (
              <Button
                label={t('HintStep.skip')}
                disabled={saving}
                extension="full"
                onClick={props.onSkip}
                theme="secondary"
                className="u-mt-half"
              />
            ) : null}
          </Stack>
        </NarrowContent>
      </Wrapper>
    </VerticallyCentered>
  )
}

const HintStep = withClient(DumbHintStep)

export default HintStep
