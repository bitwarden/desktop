import React from 'react'
import {
  useExtensionStatus
} from '../helpers/extensionStatus'

import InstallationStep from './InstallationStep'

const ConfigureExtensionStep = ({ onConnected, onSkipExtension }) => {
  const extensionStatus = useExtensionStatus()
  return <InstallationStep onSkipExtension={onSkipExtension} />
}

export default ConfigureExtensionStep
