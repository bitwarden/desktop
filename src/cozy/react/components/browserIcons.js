import BrowserSafariIcon from 'cozy-ui/transpiled/react/Icons/BrowserSafari'
import BrowserFirefoxIcon from 'cozy-ui/transpiled/react/Icons/BrowserFirefox'
import BrowserChromeIcon from 'cozy-ui/transpiled/react/Icons/BrowserChrome'
import BrowserEdgeChromiumIcon from 'cozy-ui/transpiled/react/Icons/BrowserEdgeChromium'

import StoreChromeIcon from 'cozy/react/assets/store_chrome.svg'
import StoreSafariIcon from 'cozy/react/assets/store_safari.svg'
import StoreFirefoxIcon from 'cozy/react/assets/store_firefox.svg'

const browserIcons = {
  safari: BrowserSafariIcon,
  firefox: BrowserFirefoxIcon,
  chrome: BrowserChromeIcon,
  'edge-chromium': BrowserEdgeChromiumIcon
}

export const extensionStoresIcons = {
  chrome: StoreChromeIcon,
  safari: StoreSafariIcon,
  firefox: StoreFirefoxIcon,
  'edge-chromium': StoreChromeIcon
}

export default browserIcons
