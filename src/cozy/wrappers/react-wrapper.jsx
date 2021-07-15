import {
  createGenerateClassName,
  StylesProvider,
} from "@material-ui/core/styles";
import { CozyProvider } from "cozy-client";
import { VaultProvider } from "cozy-keys-lib";
import { BreakpointsProvider } from "cozy-ui/transpiled/react/hooks/useBreakpoints";
import { I18n } from "cozy-ui/transpiled/react/I18n";
import React from "react";
import { BitwardenSettingsContext } from "../react/bitwarden-settings";
import { HashRouter } from "react-router-dom";

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
  client,
  bitwardenData,
  vaultData,
  ...props
}) => {
  const appLocale = client.getInstanceOptions().locale ?? 'en';

  return (
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
                <HashRouter>{props.children}</HashRouter>
              </BreakpointsProvider>
            </BitwardenSettingsContext.Provider>
          </VaultProvider>
        </CozyProvider>
      </I18n>
    </StylesProvider>
  );
};

export default ReactWrapper;
