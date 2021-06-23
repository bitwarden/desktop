import React from 'react'
import { render } from '@testing-library/react'

import {
  Stepper,
  Step,
  StepLabel,
  StepButton
} from 'cozy-ui/transpiled/react/Stepper'

const renderSVGWarningIcon = () => {
  const { getByRole } = render(
    <Stepper>
      <Step>
        <StepButton>
          <StepLabel error={true}>error</StepLabel>
        </StepButton>
      </Step>
    </Stepper>
  )
  const button = getByRole('button')
  const svg = button.querySelector('svg')
  return svg
}

let warningSvg

const findStepButtonFromLabelNode = node => {
  return node.parentNode.parentNode.parentNode
}

const isWarningStep = stepLabelNode => {
  const stepButtonNode = findStepButtonFromLabelNode(stepLabelNode)
  const icon = stepButtonNode.querySelector('svg')
  return icon.innerHTML == warningSvg.innerHTML
}

beforeEach(() => {
  warningSvg = renderSVGWarningIcon()
})

export { isWarningStep }
