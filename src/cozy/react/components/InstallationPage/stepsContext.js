import React from 'react'

const StepsContext = React.createContext({
  canAuthWithOIDC: false,
  isVaultConfigured: false,
  hasHint: false
})

export const useStepsContext = () => React.useContext(StepsContext)

export default StepsContext
