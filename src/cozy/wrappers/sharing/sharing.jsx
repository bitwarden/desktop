import React, { useState } from 'react'
import PropTypes from 'prop-types'

import SharingProvider, { ShareModal, ShareButton, CozyPassFingerprintDialogContent } from 'cozy-sharing'

import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

const Sharing = ({ 
    file,
    reactWrapperProps,
    confirmationMethods,
    onShared
}) => {
  const [showShareModal, setShowShareModal] = useState(false)

  const twoStepsConfirmationMethods = {
    ...confirmationMethods,
    recipientConfirmationDialogContent: CozyPassFingerprintDialogContent,
  }

  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <SharingProvider doctype="com.bitwarden.organizations" documentType="Organizations" previewPath="" onShared={onShared}>
        {showShareModal && (
          <ShareModal
          document={file}
          documentType="Organizations"
          sharingDesc={file.name}
          onClose={() => setShowShareModal(false)}
          showShareOnlyByLink={false}
          twoStepsConfirmationMethods={twoStepsConfirmationMethods}
          />
        )}
        <ShareButton
          className="u-mr-half"
          extension="full"
          useShortLabel
          docId={file.id}
          onClick={() => setShowShareModal(true)}
        />
      </SharingProvider>
    </ReactWrapper>
  )
}

Sharing.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired,
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    _type: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
  }).isRequired,
}

export default Sharing
