/* global cozy */

import 'styles'

import React from 'react'
import CozyClient, { CozyProvider } from 'cozy-client'
import { VaultProvider } from 'cozy-keys-lib'
import { render } from 'react-dom'
import { I18n } from 'cozy-ui/transpiled/react/I18n'
import flag from 'cozy-flags'
import {
  StylesProvider,
  createGenerateClassName
} from '@material-ui/core/styles'
import { WebviewIntentProvider } from 'cozy-intent'

/*
With MUI V4, it is possible to generate deterministic class names.
In the case of multiple react roots, it is necessary to disable this
feature. Since we have the cozy-bar root, we need to disable the
feature.

https://material-ui.com/styles/api/#stylesprovider
*/
const generateClassName = createGenerateClassName({
  disableGlobal: true
})

let appLocale
const renderApp = function(client) {
  const App = require('components/App').default
  render(
    <WebviewIntentProvider>
      <StylesProvider generateClassName={generateClassName}>
        <I18n
          lang={appLocale}
          dictRequire={appLocale => require(`locales/${appLocale}`)}
        >
          <CozyProvider client={client}>
            <VaultProvider instance={client.getStackClient().uri}>
              <App />
            </VaultProvider>
          </CozyProvider>
        </I18n>
      </StylesProvider>
    </WebviewIntentProvider>,
    document.querySelector('[role=application]')
  )
}

// return a defaultData if the template hasn't been replaced by cozy-stack
const getDataOrDefault = function(toTest, defaultData) {
  const templateRegex = /^\{\{\.[a-zA-Z]*\}\}$/ // {{.Example}}
  return templateRegex.test(toTest) ? defaultData : toTest
}

// initial rendering of the application
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[role=application]')
  const data = root.dataset

  const appIcon = getDataOrDefault(
    data.cozyIconPath,
    require('../vendor/assets/icon.svg')
  )

  const appNamePrefix = getDataOrDefault(
    data.cozyAppNamePrefix || require('../../../manifest.webapp').name_prefix,
    ''
  )

  const appName = getDataOrDefault(
    data.cozyAppName,
    require('../../../manifest.webapp').name
  )

  appLocale = getDataOrDefault(data.cozyLocale, 'en')

  // initialize the client to interact with the cozy stack
  const client = CozyClient.fromDOM()
  window.cozyClient = client

  client.registerPlugin(flag.plugin)

  // initialize the bar, common of all applications, it allows
  // platform features like apps navigation without doing anything
  cozy.bar.init({
    appName: appName,
    appNamePrefix: appNamePrefix,
    iconPath: appIcon,
    lang: appLocale,
    replaceTitleOnMobile: true
  })

  renderApp(client)
})
