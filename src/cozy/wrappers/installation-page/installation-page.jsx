import React from 'react';
import InstallationPage from '../../react/components/InstallationPage';
import ReactWrapper from '../react-wrapper';

// wrap original InstallationPage component
const InstallationPageWrapper = ({
  client,
  bitwardenData,
  ...props
}) => {
  return (
    <ReactWrapper
      client={client}
      bitwardenData={bitwardenData}
      {...props}
    >
      <InstallationPage></InstallationPage>
    </ReactWrapper>
  );
};

export default InstallationPageWrapper;
