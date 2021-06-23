/* global cozy */

import React from 'react'
import UIBarTitle from 'cozy-ui/transpiled/react/BarTitle'
import CozyTheme from 'cozy-ui/transpiled/react/CozyTheme'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'

const { BarCenter } = cozy.bar

const BarTitle = ({ children }) => {
  const { isMobile } = useBreakpoints()
  return isMobile ? (
    <BarCenter>
      {/* need to repeat the theme since the bar is in another react portal */}
      <CozyTheme variant="normal">
        <UIBarTitle>{children}</UIBarTitle>
      </CozyTheme>
    </BarCenter>
  ) : null
}

export default BarTitle
