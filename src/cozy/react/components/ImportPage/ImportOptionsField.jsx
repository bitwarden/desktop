import React from 'react'
import PropTypes from 'prop-types'
import Field from 'cozy-ui/transpiled/react/Field'

const ImportOptionsField = ({ vaultClient, ...props }) => {
  const importOptions = vaultClient.getImportOptions()
  const options = [
    ...importOptions.featured,
    ...importOptions.regular
  ].map(option => ({ value: option.id, label: option.name }))

  return <Field type="select" {...props} options={options} />
}

ImportOptionsField.propTypes = {
  vaultClient: PropTypes.shape({
    getImportOptions: PropTypes.func
  }).isRequired
}

export default ImportOptionsField
