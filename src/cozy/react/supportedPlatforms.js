export const platforms = {
  chrome: {
    id: 'chrome',
    type: 'browser',
    label: 'Google Chrome',
    storeUrl:
      'https://chrome.google.com/webstore/detail/cozy-personal-cloud/jplochopoaajoochpoccajmgelpfbbic'
  },
  'edge-chromium': {
    id: 'edge-chromium',
    type: 'browser',
    label: 'Edge',
    storeUrl:
      'https://chrome.google.com/webstore/detail/cozy-personal-cloud/jplochopoaajoochpoccajmgelpfbbic'
  },
  firefox: {
    id: 'firefox',
    type: 'browser',
    label: 'Mozilla Firefox',
    storeUrl:
      'https://addons.mozilla.org/en-US/firefox/addon/cozy-personal-cloud'
  },
  safari: {
    id: 'safari',
    type: 'browser',
    label: 'Safari',
    storeUrl: 'macappstore://itunes.apple.com/app/id1504487449?mt=12'
  },
  ios: {
    id: 'ios',
    type: 'os',
    os: 'ios',
    storeUrl: 'https://apps.apple.com/fr/app/cozy-pass/id1502262449'
  },
  android: {
    id: 'android',
    type: 'os',
    os: 'android',
    storeUrl: 'https://play.google.com/store/apps/details?id=io.cozy.pass'
  }
}

const getSupportedPlatforms = () => {
  return platforms
}

export const isSupportedPlatform = platformName => {
  const supportedPlatforms = getSupportedPlatforms()
  const normalizedPlatformName = platformName.trim().toLowerCase()

  return Object.keys(supportedPlatforms).includes(normalizedPlatformName)
}

export default getSupportedPlatforms
