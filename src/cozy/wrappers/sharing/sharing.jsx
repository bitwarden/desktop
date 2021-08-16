import React, { useState } from 'react'
import PropTypes from 'prop-types'

import SharingProvider, { ShareModal, ShareButton } from 'cozy-sharing'

import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

const Sharing = ({ 
    file,
    reactWrapperProps
}) => {
  const [showShareModal, setShowShareModal] = useState(false)

  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <SharingProvider doctype="com.bitwarden.organizations" documentType="Organizations">
        {showShareModal && (
          <ShareModal
          document={file}
          documentType="Organizations"
          sharingDesc={file.name}
          onClose={() => setShowShareModal(false)}
          showShareOnlyByLink={false}
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
