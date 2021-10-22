
import React, { useState, useRef } from 'react'
import ReactWrapper, { reactWrapperProps } from '../react-wrapper';

import ActionMenu, { ActionMenuItem } from 'cozy-ui/transpiled/react/ActionMenu';
import { useI18n } from 'cozy-ui/transpiled/react/I18n';
import Icon from 'cozy-ui/transpiled/react/Icon';

import TrashIcon from "cozy-ui/transpiled/react/Icons/Trash";
import RestoreIcon from "cozy-ui/transpiled/react/Icons/Restore";

const BottomMenu = ({
  isTrashContext,
  deleteCurrentCiphers,
  restoreCurrentCiphers
}) => {
  const { t } = useI18n()

  const [bottomMenuVisible, setBottomMenuVisible] = useState(false)
  const bottomMenuRef = useRef()

  const toggleActionMenu = () => {
    if (bottomMenuVisible) return hideBottomMenu()
    else showBottomMenu()
  }

  const showBottomMenu = () => {
    setBottomMenuVisible(true)
  }

  const hideBottomMenu = () => {
    setBottomMenuVisible(false)
  }

  return <>
    <button id="param-btn" onClick={toggleActionMenu} ref={bottomMenuRef}>
        <svg width="4" height="17" viewBox="0 0 8 34" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41665 0.583239C7.02784 0.194535 6.55584 0 6.00022 0H2.00007C1.4443 0 0.972306 0.194316 0.583354 0.583239C0.194402 0.972162 0 1.44449 0 1.99985V6.00007C0 6.5558 0.194402 7.02776 0.583354 7.41669C0.972087 7.80539 1.4443 8 2.00007 8H6.00022C6.55584 8 7.02784 7.80561 7.41665 7.41669C7.80545 7.02798 8 6.5558 8 6.00007V1.99978C8.00022 1.44442 7.80596 0.972089 7.41665 0.583239Z"/>
            <path d="M7.41665 26.5832C7.02784 26.1945 6.55584 26 6.00022 26H2.00007C1.4443 26 0.972306 26.1943 0.583354 26.5832C0.194402 26.9722 0 27.4445 0 27.9999V32.0001C0 32.5558 0.194402 33.0278 0.583354 33.4167C0.972087 33.8054 1.4443 34 2.00007 34H6.00022C6.55584 34 7.02784 33.8056 7.41665 33.4167C7.80545 33.028 8 32.5558 8 32.0001V27.9998C8.00022 27.4444 7.80596 26.9721 7.41665 26.5832Z"/>
            <path d="M7.41665 13.5832C7.02784 13.1945 6.55584 13 6.00022 13H2.00007C1.4443 13 0.972306 13.1943 0.583354 13.5832C0.194402 13.9722 0 14.4445 0 14.9999V19.0001C0 19.5558 0.194402 20.0278 0.583354 20.4167C0.972087 20.8054 1.4443 21 2.00007 21H6.00022C6.55584 21 7.02784 20.8056 7.41665 20.4167C7.80545 20.028 8 19.5558 8 19.0001V14.9998C8.00022 14.4444 7.80596 13.9721 7.41665 13.5832Z"/>
        </svg>
    </button>
    {bottomMenuVisible &&
      <ActionMenu
        anchorElRef={bottomMenuRef}
        autoclose={true}
        onClose={hideBottomMenu}
        className="bottom-menu"
      >
        <ActionMenuItem
          left={<Icon icon={TrashIcon} color="var(--errorColor)" />}
          onClick={deleteCurrentCiphers}
          className="u-error"
        >
            {t(isTrashContext ? `Vault.trash.permanentlyDeleteItems` : `Vault.trash.deleteItems`)}
        </ActionMenuItem>

        { isTrashContext && (
          <ActionMenuItem left={<Icon icon={RestoreIcon} />} onClick={restoreCurrentCiphers}>
            {t(`Vault.trash.restoreAllItems`)}
          </ActionMenuItem>
        )}
    </ActionMenu>}
  </>
}

const BottomMenuWrapper = ({
  reactWrapperProps,
  isTrashContext,
  deleteCurrentCiphers,
  restoreCurrentCiphers,
}) => {
  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <BottomMenu
        isTrashContext={isTrashContext}
        deleteCurrentCiphers={deleteCurrentCiphers}
        restoreCurrentCiphers={restoreCurrentCiphers}
      ></BottomMenu>
    </ReactWrapper>
  );
};

BottomMenuWrapper.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired
}

export default BottomMenuWrapper;
