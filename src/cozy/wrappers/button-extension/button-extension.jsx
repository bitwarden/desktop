import { useI18n } from 'cozy-ui/transpiled/react/I18n';
import { default as UIButtonClient } from 'cozy-ui/transpiled/react/PushClientButton';
import { extensionStoresIcons } from 'cozy/react/components/browserIcons';
import {
  extensionStatuses,
  useExtensionStatus,
} from 'cozy/react/helpers/extensionStatus';
import getSupportedPlatforms from 'cozy/react/supportedPlatforms';
import { detect as detectBrowser } from 'detect-browser';
import React from 'react';
import ReactWrapper from '../react-wrapper';

const browser = detectBrowser();

const ButtonClient = (props) => {
  const { t } = useI18n();

  const supportedPlatforms = getSupportedPlatforms();
  const platform = supportedPlatforms[browser.name] || {};
  const storeURL = platform.storeUrl;

  const icon = () => <img src={extensionStoresIcons[browser.name]}></img>;

  const label = t(`Vault.extension.cta.${browser.name}`);

  return (
    <UIButtonClient
      label={label}
      href={storeURL}
      icon={icon}
      {...props}
    ></UIButtonClient>
  );
};

// wrap original UIButtonClient component
const ImportPageWrapper = ({ client, bitwardenData, ...props }) => {
  const extensionStatus = useExtensionStatus();

  if (extensionStatus !== extensionStatuses.notInstalled) {
    return null;
  }

  return (
    <ReactWrapper client={client} bitwardenData={bitwardenData} {...props}>
      <ButtonClient {...props}></ButtonClient>
    </ReactWrapper>
  );
};

export default ImportPageWrapper;
