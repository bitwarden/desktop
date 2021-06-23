import React from 'react'
import Icon from 'cozy-ui/transpiled/react/Icon'
import './styles.css'
import cx from 'classnames'

const CircleIcon = props => {
  const { className, ...rest } = props

  return (
    <div className={cx('CircleIcon', className)}>
      <Icon {...rest} />
    </div>
  )
}

export default CircleIcon
