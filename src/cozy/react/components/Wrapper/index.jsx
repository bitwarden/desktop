import React from 'react'
import cx from 'classnames'
import './styles.css'

const Wrapper = props => {
  const { className, ...rest } = props
  return <div className={cx('Wrapper', className)} {...rest} />
}

export default Wrapper
