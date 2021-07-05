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

// return a defaultData if the template hasn't been replaced by cozy-stack
const getDataOrDefault = function (toTest, defaultData) {
  const templateRegex = /^\{\{\.[a-zA-Z]*\}\}$/; // {{.Example}}
  return templateRegex.test(toTest) ? defaultData : toTest;
};

const BitwardenWrapper = ({ bitwardenData, ...props }) => {
  return (
    <BitwardenSettingsContext.Provider value={bitwardenData}>
      <BreakpointsProvider>
        <HashRouter>{props.children}</HashRouter>
      </BreakpointsProvider>
    </BitwardenSettingsContext.Provider>
  );
};

// wrap a component in all needed providers
const ReactWrapper = ({
  client,
  bitwardenData,
  useVaultProvider = true,
  ...props
}) => {
  const root = document.querySelector("[role=application]");
  const data = root.dataset;
  let appLocale = getDataOrDefault(data.cozyLocale, "en");

  const subComponent = useVaultProvider ? (
    <VaultProvider instance={client.getStackClient().uri}>
      <BitwardenWrapper bitwardenData={bitwardenData} {...props} />
    </VaultProvider>
  ) : (
    <BitwardenWrapper bitwardenData={bitwardenData} {...props} />
  );

  return (
    <StylesProvider generateClassName={generateClassName}>
      <I18n
        lang={appLocale}
        dictRequire={(appLocale) =>
          require(`../react/locales/${appLocale}.json`)
        }
      >
        <CozyProvider client={client}>{subComponent}</CozyProvider>
      </I18n>
    </StylesProvider>
  );
};

export default ReactWrapper;
