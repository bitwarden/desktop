import React from 'react'
import { Link } from 'react-router-dom'
import snarkdown from 'snarkdown'

import Button from 'cozy-ui/transpiled/react/Button'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import NarrowContent from 'cozy-ui/transpiled/react/NarrowContent'
import PasswordExample from 'cozy-ui/transpiled/react/PasswordExample'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Card from 'cozy-ui/transpiled/react/Card'
import { MainTitle, Text } from 'cozy-ui/transpiled/react/Text'
import { UnorderedList, ListItem } from 'cozy-ui/transpiled/react/UnorderedList'
import { useClient } from 'cozy-client'
import flag from 'cozy-flags'

import Wrapper from 'cozy/react/components/Wrapper'
import VerticallyCentered from 'cozy/react/components/VerticallyCentered'
import strongPasswordIcon from 'cozy/react/assets/strong-password.svg'
import { canAuthWithOIDC } from 'cozy/react/helpers/oidc'
import { useStepsContext } from 'cozy/react/components/InstallationPage/stepsContext'
import ChangePasswordLink from 'cozy/react/components/ChangePasswordLink'
import SetVaultPasswordForm from 'cozy/react/components/SetVaultPasswordForm'

const DefaultSecurityStep = ({ onSkip }) => {
  const { t } = useI18n()

  return (
    <VerticallyCentered>
      <Wrapper>
        <NarrowContent>
          <Stack>
            <img src={strongPasswordIcon} alt="" width={204} height={137} />
            <MainTitle>{t('SecurityStep.title')}</MainTitle>
            <Stack spacing="xxl">
              <Text>{t('SecurityStep.description')}</Text>
              <Card>
                <UnorderedList className="u-ta-left u-mv-0">
                  <ListItem
                    dangerouslySetInnerHTML={{
                      __html: snarkdown(
                        t('SecurityStep.advices.strong_passphrase')
                      )
                    }}
                  />
                  <ListItem
                    dangerouslySetInnerHTML={{
                      __html: snarkdown(t('SecurityStep.advices.memorize'))
                    }}
                  />
                  <ListItem>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: snarkdown(t('SecurityStep.advices.our_tip'))
                      }}
                    />
                    <PasswordExample
                      color={false}
                      password={t('SecurityStep.password-example')}
                    />
                  </ListItem>
                </UnorderedList>
              </Card>
              <Stack spacing="xs">
                <ChangePasswordLink
                  label={t('SecurityStep.enhance-password')}
                  successRoute="#/installation/configureExtension"
                  cancelRoute="#/installation/hint"
                  extension="full"
                />
                <Button
                  tag={Link}
                  onClick={onSkip}
                  label={t('SecurityStep.keep-password')}
                  theme="secondary"
                  className="u-mt-half"
                  extension="full"
                />
              </Stack>
            </Stack>
          </Stack>
        </NarrowContent>
      </Wrapper>
    </VerticallyCentered>
  )
}

const OIDCSecurityStep = ({ onNext }) => {
  const { t } = useI18n()

  const { isVaultConfigured: rawIsVaultConfigured } = useStepsContext()

  const isVaultConfigured =
    flag('passwords.force-vault-configured') === null
      ? rawIsVaultConfigured
      : flag('passwords.force-vault-configured')

  return (
    <VerticallyCentered>
      <Wrapper>
        <NarrowContent>
          <Stack>
            <img src={strongPasswordIcon} alt="" width={204} height={137} />
            <MainTitle>
              {isVaultConfigured
                ? t('SecurityStepOIDC.title-configured')
                : t('SecurityStepOIDC.title')}
            </MainTitle>
            <Stack spacing="xl">
              <Text>
                {isVaultConfigured
                  ? t('SecurityStepOIDC.description-configured')
                  : t('SecurityStepOIDC.description')}
              </Text>
              {isVaultConfigured ? (
                <div>
                  <ChangePasswordLink
                    extension="full"
                    theme="secondary"
                    label={t('UpdateCozyPassPassword')}
                    successRoute="#/installation/configureExtension"
                    cancelRoute="#/installation/configureExtension"
                  />
                </div>
              ) : (
                <>
                  <SetVaultPasswordForm onSuccess={onNext} />
                  <Card>
                    <UnorderedList className="u-ta-left u-mv-0">
                      <ListItem
                        dangerouslySetInnerHTML={{
                          __html: snarkdown(
                            t('SecurityStep.advices.strong_passphrase')
                          )
                        }}
                      />
                      <ListItem
                        dangerouslySetInnerHTML={{
                          __html: snarkdown(t('SecurityStep.advices.memorize'))
                        }}
                      />
                      <ListItem>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: snarkdown(t('SecurityStep.advices.our_tip'))
                          }}
                        />
                        <PasswordExample
                          color={false}
                          password={t('SecurityStep.password-example')}
                        />
                      </ListItem>
                    </UnorderedList>
                  </Card>
                </>
              )}
            </Stack>
          </Stack>
        </NarrowContent>
      </Wrapper>
    </VerticallyCentered>
  )
}

const SecurityStep = props => {
  const client = useClient()

  if (canAuthWithOIDC(client)) {
    return <OIDCSecurityStep {...props} />
  }
  return <DefaultSecurityStep {...props} />
}

export default SecurityStep
