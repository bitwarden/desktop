import React from 'react'
import cx from 'classnames'

const VerticallyCentered = ({ className, ...props }) => {
  return (
    <div
      className={cx('u-pv-2', 'u-mt-auto', 'u-mb-auto', className)}
      {...props}
    />
  )
}

export default VerticallyCentered
