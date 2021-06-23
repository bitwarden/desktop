import React, { useEffect } from 'react'
import { hot } from 'react-hot-loader'
import {
  BitwardenSettingsContext,
  useBitwardenSettingsQuery
} from '../bitwarden-settings'
import { Route, Switch, Redirect, HashRouter } from 'react-router-dom'
import { Layout, Main, Content } from 'cozy-ui/transpiled/react/Layout'
import { Sprite as IconSprite } from 'cozy-ui/transpiled/react/Icon'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import MuiCozyTheme from 'cozy-ui/transpiled/react/MuiCozyTheme'

import Sidebar from './Sidebar'

import ImportPage from './ImportPage'
import InstallationPage from './InstallationPage'

import flag, { FlagSwitcher } from 'cozy-flags'
import minilog from 'minilog'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/hooks/useBreakpoints'

window.minilog = minilog
window.flag = flag

const Routes = () => (
  <Switch>
    <Route path="/installation/import" exact component={ImportPage} />
    <Route path="/installation/:step" component={InstallationPage} />
    <Route path="/installation" component={InstallationPage} />
    <Route path="/import" exact component={ImportPage} />
    <Redirect from="/" to="/installation" />
    <Redirect from="*" to="/installation" />
  </Switch>
)

export const DumbApp = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      flag('switcher', true)
    }
  }, [])

  const queryResult = useBitwardenSettingsQuery()

  if (queryResult.fetchStatus === 'loading') {
    return null
  }

  return (
    <BitwardenSettingsContext.Provider value={queryResult.data}>
      <BreakpointsProvider>
        <MuiCozyTheme>
          <HashRouter>
            <Layout>
              <Sidebar />
              <Main>
                <Content>
                  <Routes />
                </Content>
              </Main>
              <IconSprite />
              <Alerter />
              <FlagSwitcher />
            </Layout>
          </HashRouter>
        </MuiCozyTheme>
      </BreakpointsProvider>
    </BitwardenSettingsContext.Provider>
  )
}

const App = DumbApp

/*
  Enable Hot Module Reload using `react-hot-loader` here
  We enable it here since App is the main root component
  No need to use it anywhere else, it sould work for all
  child components
*/
export default hot(module)(App)
