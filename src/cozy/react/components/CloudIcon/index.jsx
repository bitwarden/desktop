import React from 'react'
import Icon from 'cozy-ui/transpiled/react/Icon'
import './styles.css'

import CloudIcon from 'cozy-ui/transpiled/react/Icons/Cloud'

const PasswordsCloudIcon = props => {
  return (
    <Icon
      icon={CloudIcon}
      size={16}
      color="var(--charcoalGrey)"
      className="CloudIcon"
      {...props}
    />
  )
}

export default PasswordsCloudIcon
