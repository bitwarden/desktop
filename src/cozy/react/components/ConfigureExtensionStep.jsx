import React from 'react'
import {
  useExtensionStatus,
  extensionStatuses
} from '../helpers/extensionStatus'

import InstallationStep from './InstallationStep'
import InstalledStep from './InstalledStep'
import ConnectedStep from './ConnectedStep'

const ConfigureExtensionStep = ({ onConnected }) => {
  const extensionStatus = useExtensionStatus()
  if (extensionStatus == extensionStatuses.installed) {
    return <InstalledStep onConnected={onConnected} />
  } else if (extensionStatus === extensionStatuses.connected) {
    return <ConnectedStep />
  } else {
    return <InstallationStep />
  }
}

export default ConfigureExtensionStep
