import React from 'react'
import PropTypes from 'prop-types'

import SharingProvider, { ConfirmTrustedRecipientsDialog, CozyPassFingerprintDialogContent } from 'cozy-sharing'

import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

const ConfirmTrustedUsers = ({
    reactWrapperProps,
    confirmationMethods,
    showModal = false,
    closeModal
}) => {
  const twoStepsConfirmationMethods = {
    ...confirmationMethods,
    recipientConfirmationDialogContent: CozyPassFingerprintDialogContent,
  }

  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <SharingProvider doctype="com.bitwarden.organizations" documentType="Organizations" previewPath="">
        {showModal && (
          <ConfirmTrustedRecipientsDialog
            onClose={closeModal}
            twoStepsConfirmationMethods={twoStepsConfirmationMethods}
          />
        )}
      </SharingProvider>
    </ReactWrapper>
  )
}

ConfirmTrustedUsers.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired,
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired
}

export default ConfirmTrustedUsers
