import React from 'react'
import cx from 'classnames'

import { useI18n } from 'cozy-ui/transpiled/react/I18n'

import playBadgeEn from 'assets/google-play-badge-en.png'
import playBadgeFr from 'assets/google-play-badge-fr.png'

import appStoreBadgeEn from 'assets/app-store-badge-en.png'
import appStoreBadgeFr from 'assets/app-store-badge-fr.png'

import './styles.css'

const playStoreBadges = {
  en: playBadgeEn,
  fr: playBadgeFr
}

const appStoreBadges = {
  en: appStoreBadgeEn,
  fr: appStoreBadgeFr
}

export const AppStoreButton = props => {
  const { lang } = useI18n()
  const badge = appStoreBadges[lang] || appStoreBadges.en
  return (
    <a {...props} className={cx(props.className, 'StoreButton')}>
      <img src={badge} className="StoreButton__Image" />
    </a>
  )
}

export const PlayStoreButton = props => {
  const { lang } = useI18n()
  const badge = playStoreBadges[lang] || playStoreBadges.en
  return (
    <a {...props} className={cx(props.className, 'StoreButton')}>
      <img src={badge} className="StoreButton__Image" />
    </a>
  )
}
