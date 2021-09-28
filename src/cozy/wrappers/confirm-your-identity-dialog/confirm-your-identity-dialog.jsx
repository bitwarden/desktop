import React from 'react'
import PropTypes from 'prop-types'

import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

import Button from 'cozy-ui/transpiled/react/Button'
import { FixedDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import Paper from 'cozy-ui/transpiled/react/Paper'
import Typography from 'cozy-ui/transpiled/react/Typography'

import './styles.css'

const ConfirmYourIdentityModal = ({ 
  ownerName,
  fingerprintPhrase,
  onClose
}) => {
  const { t } = useI18n()
  
  let dialogTitle = t(`ConfirmYourIdentityModal.title`)

  const instruction1 =  t(`ConfirmYourIdentityModal.instruction`, {
    ownerName: ownerName
  })

  const instruction2 = t(`ConfirmYourIdentityModal.instruction2`, {
    ownerName: ownerName
  })

  let dialogContent = (
    <>
      <div>
        <Typography variant="body1">
          {instruction1}
        </Typography>
        <Paper
          className="ConfirmYourIdentityModal__fingerprint"
          elevation={1}
        >
          <Typography variant="body1">
            {fingerprintPhrase}
          </Typography>
        </Paper>
        <Typography variant="body1">
          {instruction2}
        </Typography>
      </div>
    </>
  )
  let dialogActions = (
    <Button
      theme="primary"
      label={t(`ConfirmYourIdentityModal.confirm`)}
      onClick={onClose}
    />
  )

  return (
    <FixedDialog
      disableEnforceFocus
      open={true}
      onClose={onClose}
      title={dialogTitle}
      content={dialogContent}
      actions={dialogActions}
    />
  )
}

const ConfirmYourIdentity = ({
    reactWrapperProps,
    ownerName,
    fingerprintPhrase,
    showModal = false,
    closeModal
}) => {
  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      {showModal && (
        <ConfirmYourIdentityModal
          ownerName={ownerName}
          fingerprintPhrase={fingerprintPhrase}
          onClose={closeModal}
        >
        </ConfirmYourIdentityModal>
      )}
      
    </ReactWrapper>
  )
}

ConfirmYourIdentity.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired,
  ownerName: PropTypes.string.isRequired,
  fingerprintPhrase: PropTypes.string.isRequired,
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired
}

export default ConfirmYourIdentity
