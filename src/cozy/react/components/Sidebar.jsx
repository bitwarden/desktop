import React, { useContext } from 'react'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import { NavLink } from 'react-router-dom'
import { BitwardenSettingsContext } from '../bitwarden-settings'
import flag from 'cozy-flags'

const isInstallationLinkMatching = (match, location) => {
  if (!match) {
    return false
  }
  if (location.pathname.includes('import')) {
    return false
  }
  return true
}

export const Sidebar = () => {
  const { t } = useI18n()
  const bitwardenSettings = useContext(BitwardenSettingsContext)
  const isVaultConfigured =
    bitwardenSettings && bitwardenSettings.extension_installed
  return isVaultConfigured ? (
    <aside className="o-sidebar">
      <nav>
        <ul className="c-nav">
          <li className="c-nav-item">
            <NavLink
              to="/installation"
              className="c-nav-link"
              isActive={isInstallationLinkMatching}
              activeClassName="is-active"
            >
              {t('Nav.installation')}
            </NavLink>
          </li>
          <li className="c-nav-item">
            <NavLink
              to="/installation/import"
              className="c-nav-link"
              activeClassName="is-active"
            >
              {t('Nav.import')}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  ) : null
}

export default flag.connect(Sidebar)
