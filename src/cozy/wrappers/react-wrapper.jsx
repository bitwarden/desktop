import {
  createGenerateClassName,
  StylesProvider,
} from "@material-ui/core/styles";
import { CozyProvider } from "cozy-client";
import { VaultProvider } from "cozy-keys-lib";
import { BreakpointsProvider } from "cozy-ui/transpiled/react/hooks/useBreakpoints";
import { I18n } from "cozy-ui/transpiled/react/I18n";
import React from "react";
import PropTypes from 'prop-types';
import { BitwardenSettingsContext } from "../react/bitwarden-settings";
import { HashRouter } from "react-router-dom";

import MuiCozyTheme from 'cozy-ui/transpiled/react/MuiCozyTheme'
import { WebviewIntentProvider } from 'cozy-intent'

const bitwardenDataProps = PropTypes.shape({
  extension_installed: PropTypes.bool.isRequired
});

const vaultDataProps = PropTypes.shape({
  apiService: PropTypes.object.isRequired,
  environmentService: PropTypes.object.isRequired,
  authService: PropTypes.object.isRequired,
  syncService: PropTypes.object.isRequired,
  cryptoService: PropTypes.object.isRequired,
  cipherService: PropTypes.object.isRequired,
  userService: PropTypes.object.isRequired,
  collectionService: PropTypes.object.isRequired,
  passwordGenerationService: PropTypes.object.isRequired,
  vaultTimeoutService: PropTypes.object.isRequired,
  containerService: PropTypes.object.isRequired,
  importService: PropTypes.object.isRequired,
  utils: PropTypes.func.isRequired
});

export const reactWrapperProps = PropTypes.shape({
  client: PropTypes.object.isRequired,
  bitwardenData: bitwardenDataProps.isRequired,
  vaultData: vaultDataProps.isRequired
})

/* 
With MUI V4, it is possible to generate deterministic class names. 
In the case of multiple react roots, it is necessary to disable this 
feature. Since we have the cozy-bar root, we need to disable the 
feature. 
 
https://material-ui.com/styles/api/#stylesprovider 
*/
const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

// wrap a component in all needed providers
const ReactWrapper = ({
  reactWrapperProps,
  ...props
}) => {
  const { client, bitwardenData, vaultData } = reactWrapperProps;

  const appLocale = client.getInstanceOptions().locale ?? 'en';

  return (
    <WebviewIntentProvider>
      <StylesProvider generateClassName={generateClassName}>
        <I18n
          lang={appLocale}
          dictRequire={(appLocale) =>
            require(`../react/locales/${appLocale}.json`)
          }
        >
          <CozyProvider client={client}>
            <VaultProvider instance={client.getStackClient().uri} vaultData={vaultData}>
              <BitwardenSettingsContext.Provider value={bitwardenData}>
                <BreakpointsProvider>
                  <MuiCozyTheme>
                    <HashRouter>{props.children}</HashRouter>
                  </MuiCozyTheme>
                </BreakpointsProvider>
              </BitwardenSettingsContext.Provider>
            </VaultProvider>
          </CozyProvider>
        </I18n>
      </StylesProvider>
    </WebviewIntentProvider>
  );
};

ReactWrapper.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired
}

export default ReactWrapper;
