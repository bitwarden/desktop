import React from 'react';
import PropTypes from 'prop-types';
import InstallationPage from '../../react/components/InstallationPage';
import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

// wrap original InstallationPage component
const InstallationPageWrapper = ({
  reactWrapperProps,
  onSkipExtension
}) => {
  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <InstallationPage onSkipExtension={onSkipExtension}></InstallationPage>
    </ReactWrapper>
  );
};

InstallationPageWrapper.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired,
  onSkipExtension: PropTypes.func.isRequired,
}

export default InstallationPageWrapper;
