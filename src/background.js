window.forge = require('node-forge');
window.tldjs = require('tldjs');

// Service imports
import ApiService from './services/api.service';
import AppIdService from './services/appId.service';
import AutofillService from './services/autofill.service';
import CipherService from './services/cipher.service';
import CollectionService from './services/collection.service';
import ConstantsService from './services/constants.service';
import CryptoService from './services/crypto.service';
import EnvironmentService from './services/environment.service';
import FolderService from './services/folder.service';
import i18nService from './services/i18nService.js';
import LockService from './services/lock.service';
import PasswordGenerationService from './services/passwordGeneration.service';
import SettingsService from './services/settings.service';
import SyncService from './services/sync.service';
import TokenService from './services/token.service';
import TotpService from './services/totp.service';
import UserService from './services/user.service';
import UtilsService from './services/utils.service';

// Model imports
import { Attachment } from './models/domain/attachment';
import { Card } from './models/domain/card';
import { Cipher } from './models/domain/cipher';
import { Field } from './models/domain/field';
import { Folder } from './models/domain/folder';
import { Identity } from './models/domain/identity';
import { Login } from './models/domain/login';
import { SecureNote } from './models/domain/secureNote';

import { AttachmentData } from './models/data/attachmentData';
import { CardData } from './models/data/cardData';
import { CipherData } from './models/data/cipherData';
import { FieldData } from './models/data/fieldData';
import { FolderData } from './models/data/folderData';
import { IdentityData } from './models/data/identityData';
import { LoginData } from './models/data/loginData';
import { SecureNoteData } from './models/data/secureNoteData';

import { CipherString } from './models/domain/cipherString';

import { CipherRequest } from './models/request/cipherRequest';
import { DeviceRequest } from './models/request/deviceRequest';
import { DeviceTokenRequest } from './models/request/deviceTokenRequest';
import { FolderRequest } from './models/request/folderRequest';
import { PasswordHintRequest } from './models/request/passwordHintRequest';
import { RegisterRequest } from './models/request/registerRequest';
import { TokenRequest } from './models/request/tokenRequest';
import { TwoFactorEmailRequest } from './models/request/twoFactorEmailRequest';

import { AttachmentResponse } from './models/response/attachmentResponse';
import { CipherResponse } from './models/response/cipherResponse';
import { DeviceResponse } from './models/response/deviceResponse';
import { DomainsResponse } from './models/response/domainsResponse';
import { ErrorResponse } from './models/response/errorResponse';
import { FolderResponse } from './models/response/folderResponse';
import { GlobalDomainResponse } from './models/response/globalDomainResponse';
import { IdentityTokenResponse } from './models/response/identityTokenResponse';
import { KeysResponse } from './models/response/keysResponse';
import { ListResponse } from './models/response/listResponse';
import { ProfileOrganizationResponse } from './models/response/profileOrganizationResponse';
import { ProfileResponse } from './models/response/profileResponse';
import { SyncResponse } from './models/response/syncResponse';

var bg_isBackground = true,
    bg_utilsService,
    bg_i18nService,
    bg_constantsService,
    bg_cryptoService,
    bg_tokenService,
    bg_appIdService,
    bg_apiService,
    bg_environmentService,
    bg_userService,
    bg_settingsService,
    bg_cipherService,
    bg_folderService,
    bg_collectionService,
    bg_lockService,
    bg_syncService,
    bg_passwordGenerationService,
    bg_totpService,
    bg_autofillService;

(function () {
    var loginToAutoFill = null,
        pageDetailsToAutoFill = [],
        autofillTimeout = null,
        menuOptionsLoaded = [],
        pendingAuthRequests = [],
        syncTimeout = null,
        bg_loginsToAdd = [],
        bg_sidebarAction = (typeof opr !== 'undefined') && opr.sidebarAction ? opr.sidebarAction : chrome.sidebarAction;

    // init services
    window.bg_utilsService = bg_utilsService = new UtilsService();
    window.bg_i18nService = bg_i18nService = new i18nService(bg_utilsService);
    window.bg_constantsService = bg_constantsService = new ConstantsService(bg_i18nService);
    window.bg_cryptoService = bg_cryptoService = new CryptoService();
    window.bg_tokenService = bg_tokenService = new TokenService();
    window.bg_appIdService = bg_appIdService = new AppIdService();
    window.bg_apiService = bg_apiService = new ApiService(bg_tokenService, logout);
    window.bg_environmentService = bg_environmentService = new EnvironmentService(bg_apiService);
    window.bg_userService = bg_userService = new UserService(bg_tokenService);
    window.bg_settingsService = bg_settingsService = new SettingsService(bg_userService);
    window.bg_cipherService = bg_cipherService = new CipherService(bg_cryptoService, bg_userService, bg_settingsService, bg_apiService);
    window.bg_folderService = bg_folderService = new FolderService(bg_cryptoService, bg_userService, bg_i18nService, bg_apiService);
    window.bg_collectionService = bg_collectionService = new CollectionService(bg_cryptoService, bg_userService, bg_i18nService, bg_apiService);
    window.bg_lockService = bg_lockService = new LockService(bg_cipherService, bg_folderService, bg_collectionService, bg_cryptoService, bg_utilsService, setIcon, refreshBadgeAndMenu);
    window.bg_syncService = bg_syncService = new SyncService(bg_userService, bg_apiService, bg_settingsService, bg_folderService, bg_cipherService, bg_cryptoService, bg_collectionService, logout);
    window.bg_passwordGenerationService = bg_passwordGenerationService = new PasswordGenerationService(bg_cryptoService);
    window.bg_totpService = bg_totpService = new TotpService();
    window.bg_autofillService = bg_autofillService = new AutofillService(bg_cipherService, bg_tokenService, bg_totpService, bg_utilsService);

    require('./scripts/analytics.js');

    if (chrome.commands) {
        chrome.commands.onCommand.addListener(function (command) {
            if (command === 'generate_password') {
                ga('send', {
                    hitType: 'event',
                    eventAction: 'Generated Password From Command'
                });
                bg_passwordGenerationService.getOptions().then(function (options) {
                    var password = PasswordGenerationService.generatePassword(options);
                    bg_utilsService.copyToClipboard(password);
                    bg_passwordGenerationService.addHistory(password);
                });
            }
            else if (command === 'autofill_login') {
                chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
                    if (tabs.length) {
                        ga('send', {
                            hitType: 'event',
                            eventAction: 'Autofilled From Command'
                        });
                        collectPageDetailsForContentScript(tabs[0], 'autofill_cmd');
                    }
                });
            }
        });
    }

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'loggedIn' || msg.command === 'unlocked' || msg.command === 'locked') {
            setIcon();
            refreshBadgeAndMenu();
        }
        else if (msg.command === 'logout') {
            logout(msg.expired, function () { });
        }
        else if (msg.command === 'syncCompleted' && msg.successfully) {
            setTimeout(refreshBadgeAndMenu, 2000);
        }
        else if (msg.command === 'bgOpenOverlayPopup') {
            messageCurrentTab('openOverlayPopup', msg.data);
        }
        else if (msg.command === 'bgCloseOverlayPopup') {
            messageCurrentTab('closeOverlayPopup');
        }
        else if (msg.command === 'bgOpenNotificationBar') {
            messageTab(sender.tab.id, 'openNotificationBar', msg.data);
        }
        else if (msg.command === 'bgCloseNotificationBar') {
            messageTab(sender.tab.id, 'closeNotificationBar');
        }
        else if (msg.command === 'bgAdjustNotificationBar') {
            messageTab(sender.tab.id, 'adjustNotificationBar', msg.data);
        }
        else if (msg.command === 'bgCollectPageDetails') {
            collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
        }
        else if (msg.command === 'bgAddLogin') {
            addLogin(msg.login, sender.tab);
        }
        else if (msg.command === 'bgAddClose') {
            removeAddLogin(sender.tab);
        }
        else if (msg.command === 'bgAddSave') {
            saveAddLogin(sender.tab);
        }
        else if (msg.command === 'bgNeverSave') {
            saveNever(sender.tab);
        }
        else if (msg.command === 'collectPageDetailsResponse') {
            if (msg.sender === 'notificationBar') {
                var forms = bg_autofillService.getFormsWithPasswordFields(msg.details);
                messageTab(msg.tab.id, 'notificationBarPageDetails', { details: msg.details, forms: forms });
            }
            else if (msg.sender === 'autofiller' || msg.sender === 'autofill_cmd') {
                bg_autofillService.doAutoFillForLastUsedLogin([{
                    frameId: sender.frameId, tab: msg.tab, details: msg.details
                }], msg.sender === 'autofill_cmd');
            }
            else if (msg.sender === 'contextMenu') {
                clearTimeout(autofillTimeout);
                pageDetailsToAutoFill.push({ frameId: sender.frameId, tab: msg.tab, details: msg.details });
                autofillTimeout = setTimeout(autofillPage, 300);
            }
        } else if (msg.command === 'bgUpdateContextMenu') {
            refreshBadgeAndMenu();
        }
    });

    if (chrome.runtime.onInstalled) {
        chrome.runtime.onInstalled.addListener(function (details) {
            ga('send', {
                hitType: 'event',
                eventAction: 'onInstalled ' + details.reason
            });

            if (details.reason === 'install') {
                chrome.tabs.create({ url: 'https://bitwarden.com/browser-start/' }, function (tab) { });
            }
        });
    }

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        refreshBadgeAndMenu();
    });

    var onReplacedRan = false;
    chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
        if (onReplacedRan) {
            return;
        }
        onReplacedRan = true;
        checkbg_loginsToAdd();
        refreshBadgeAndMenu();
    });

    var onUpdatedRan = false;
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (onUpdatedRan) {
            return;
        }
        onUpdatedRan = true;
        checkbg_loginsToAdd();
        refreshBadgeAndMenu();
    });

    if (chrome.windows) {
        chrome.windows.onFocusChanged.addListener(function (windowId) {
            if (windowId === null || windowId < 0) {
                return;
            }

            refreshBadgeAndMenu();
        });
    }

    if (chrome.contextMenus) {
        chrome.contextMenus.onClicked.addListener(function (info, tab) {
            if (info.menuItemId === 'generate-password') {
                ga('send', {
                    hitType: 'event',
                    eventAction: 'Generated Password From Context Menu'
                });
                bg_passwordGenerationService.getOptions().then(function (options) {
                    var password = PasswordGenerationService.generatePassword(options);
                    bg_utilsService.copyToClipboard(password);
                    bg_passwordGenerationService.addHistory(password);
                });
            }
            else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
                info.parentMenuItemId === 'copy-password') {
                var id = info.menuItemId.split('_')[1];
                if (id === 'noop') {
                    if (chrome.browserAction.openPopup) {
                        chrome.browserAction.openPopup();
                    }

                    return;
                }

                bg_cipherService.getAllDecrypted().then(function (ciphers) {
                    for (var i = 0; i < ciphers.length; i++) {
                        if (ciphers[i].id === id) {
                            if (info.parentMenuItemId === 'autofill') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Autofilled From Context Menu'
                                });
                                startAutofillPage(ciphers[i]);
                            }
                            else if (info.parentMenuItemId === 'copy-username') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Username From Context Menu'
                                });
                                bg_utilsService.copyToClipboard(ciphers[i].login.username);
                            }
                            else if (info.parentMenuItemId === 'copy-password') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Password From Context Menu'
                                });
                                bg_utilsService.copyToClipboard(ciphers[i].login.password);
                            }
                            return;
                        }
                    }
                }, function () {

                });
            }
        });
    }

    if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
        chrome.webRequest.onAuthRequired.addListener(function (details, callback) {
            if (!details.url || pendingAuthRequests.indexOf(details.requestId) != -1) {
                if (callback) {
                    callback();
                }
                return;
            }

            var domain = bg_utilsService.getDomain(details.url);
            if (!domain) {
                if (callback) {
                    callback();
                }
                return;
            }

            pendingAuthRequests.push(details.requestId);

            if (bg_utilsService.isFirefox()) {
                return new Promise(function (resolve, reject) {
                    bg_cipherService.getAllDecryptedForDomain(domain).then(function (ciphers) {
                        if (!ciphers || ciphers.length !== 1) {
                            reject();
                            return;
                        }

                        resolve({
                            authCredentials: {
                                username: ciphers[0].login.username,
                                password: ciphers[0].login.password
                            }
                        });
                    }, function () {
                        reject();
                    });
                });
            }
            else {
                bg_cipherService.getAllDecryptedForDomain(domain).then(function (ciphers) {
                    if (!ciphers || ciphers.length !== 1) {
                        callback();
                        return;
                    }

                    callback({
                        authCredentials: {
                            username: ciphers[0].login.username,
                            password: ciphers[0].login.password
                        }
                    });
                }, function () {
                    callback();
                });
            }
        }, { urls: ['http://*/*', 'https://*/*'] }, [bg_utilsService.isFirefox() ? 'blocking' : 'asyncBlocking']);

        chrome.webRequest.onCompleted.addListener(completeAuthRequest, { urls: ['http://*/*'] });
        chrome.webRequest.onErrorOccurred.addListener(completeAuthRequest, { urls: ['http://*/*'] });
    }

    function completeAuthRequest(details) {
        var i = pendingAuthRequests.indexOf(details.requestId);
        if (i > -1) {
            pendingAuthRequests.splice(i, 1);
        }
    }

    var buildingContextMenu = false;
    function buildContextMenu(callback) {
        if (!chrome.contextMenus || buildingContextMenu) {
            return;
        }
        buildingContextMenu = true;

        chrome.contextMenus.removeAll(function () {
            chrome.contextMenus.create({
                type: 'normal',
                id: 'root',
                contexts: ['all'],
                title: 'bitwarden'
            }, function () {
                chrome.contextMenus.create({
                    type: 'normal',
                    id: 'autofill',
                    parentId: 'root',
                    contexts: ['all'],
                    title: bg_i18nService.autoFill
                }, function () {
                    if (bg_utilsService.isFirefox() || bg_utilsService.isEdge()) {
                        // Firefox & Edge do not support writing to the clipboard from background
                        buildingContextMenu = false;
                        if (callback) {
                            callback();
                        }
                        return;
                    }

                    chrome.contextMenus.create({
                        type: 'normal',
                        id: 'copy-username',
                        parentId: 'root',
                        contexts: ['all'],
                        title: bg_i18nService.copyUsername
                    }, function () {
                        chrome.contextMenus.create({
                            type: 'normal',
                            id: 'copy-password',
                            parentId: 'root',
                            contexts: ['all'],
                            title: bg_i18nService.copyPassword
                        }, function () {
                            chrome.contextMenus.create({
                                type: 'separator',
                                parentId: 'root'
                            });

                            chrome.contextMenus.create({
                                type: 'normal',
                                id: 'generate-password',
                                parentId: 'root',
                                contexts: ['all'],
                                title: bg_i18nService.generatePasswordCopied
                            }, function () {
                                buildingContextMenu = false;
                                if (callback) {
                                    callback();
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    function setIcon() {
        if (!chrome.browserAction && !bg_sidebarAction) {
            return;
        }

        var isAuthenticated;
        bg_userService.isAuthenticated().then(function (theIsAuthenticated) {
            isAuthenticated = theIsAuthenticated;
            return bg_cryptoService.getKey();
        }).then(function (key) {
            var suffix = '';
            if (!isAuthenticated) {
                suffix = '_gray';
            }
            else if (!key) {
                suffix = '_locked';
            }

            actionSetIcon(chrome.browserAction, suffix);
            actionSetIcon(bg_sidebarAction, suffix);
        });

        function actionSetIcon(theAction, suffix) {
            if (theAction && theAction.setIcon) {
                theAction.setIcon({
                    path: {
                        '19': 'images/icon19' + suffix + '.png',
                        '38': 'images/icon38' + suffix + '.png',
                    }
                });
            }
        }
    }

    function refreshBadgeAndMenu() {
        if (!chrome.windows || !chrome.contextMenus) {
            return;
        }

        chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
            var tab = null;
            if (tabs.length > 0) {
                tab = tabs[0];
            }

            if (!tab) {
                return;
            }

            chrome.storage.local.get(bg_constantsService.disableContextMenuItemKey, function (obj) {
                if (!obj[bg_constantsService.disableContextMenuItemKey]) {
                    buildContextMenu(function () {
                        contextMenuReady(tab, true);
                    });
                }
                else {
                    chrome.contextMenus.removeAll();
                    contextMenuReady(tab, false);
                }
            });
        });
    }

    function contextMenuReady(tab, contextMenuEnabled) {
        loadMenuAndUpdateBadge(tab.url, tab.id, contextMenuEnabled);
        onUpdatedRan = onReplacedRan = false;
    }

    function loadMenuAndUpdateBadge(url, tabId, contextMenuEnabled) {
        if (!chrome.browserAction && !bg_sidebarAction) {
            return;
        }

        if (!url) {
            return;
        }

        var tabDomain = bg_utilsService.getDomain(url);
        if (!tabDomain) {
            return;
        }

        setActionBadgeColor(chrome.browserAction);
        setActionBadgeColor(bg_sidebarAction);

        menuOptionsLoaded = [];
        bg_cipherService.getAllDecryptedForDomain(tabDomain).then(function (ciphers) {
            ciphers.sort(bg_cipherService.sortCiphersByLastUsedThenName);

            if (contextMenuEnabled) {
                for (var i = 0; i < ciphers.length; i++) {
                    loadLoginContextMenuOptions(ciphers[i]);
                }
            }

            var theText = '';
            if (ciphers.length > 0 && ciphers.length < 9) {
                theText = ciphers.length.toString();
            }
            else if (ciphers.length > 0) {
                theText = '9+';
            }
            else {
                if (contextMenuEnabled) {
                    loadNoLoginsContextMenuOptions(bg_i18nService.noMatchingLogins);
                }
            }

            setBrowserActionText(theText, tabId);
            setSidebarActionText(theText, tabId);
        }, function () {
            if (contextMenuEnabled) {
                loadNoLoginsContextMenuOptions(bg_i18nService.vaultLocked);
            }
            setBrowserActionText('', tabId);
            setSidebarActionText('', tabId);
        });

        function setActionBadgeColor(theAction) {
            if (theAction && theAction.setBadgeBackgroundColor) {
                theAction.setBadgeBackgroundColor({ color: '#294e5f' });
            }
        }

        function setBrowserActionText(text, tabId) {
            if (chrome.browserAction && chrome.browserAction.setBadgeText) {
                chrome.browserAction.setBadgeText({
                    text: text,
                    tabId: tabId
                });
            }
        }

        function setSidebarActionText(text, tabId) {
            if (!bg_sidebarAction) {
                return;
            }

            if (bg_sidebarAction.setBadgeText) {
                bg_sidebarAction.setBadgeText({
                    text: text,
                    tabId: tabId
                });
            }
            else if (bg_sidebarAction.setTitle) {
                var title = 'bitwarden';
                if (text && text !== '') {
                    title += (' [' + text + ']');
                }
                bg_sidebarAction.setTitle({
                    title: title,
                    tabId: tabId
                });
            }
        }
    }

    function messageCurrentTab(command, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tabId = null;
            if (tabs.length > 0) {
                tabId = tabs[0].id;
            }
            else {
                return;
            }

            messageTab(tabId, command, data);
        });
    }

    function messageTab(tabId, command, data, callback) {
        if (!tabId) {
            return;
        }

        var obj = {
            command: command
        };

        if (data) {
            obj.data = data;
        }

        chrome.tabs.sendMessage(tabId, obj, function () {
            if (callback) {
                callback();
            }
        });
    }

    function collectPageDetailsForContentScript(tab, sender, frameId) {
        if (!tab || !tab.id) {
            return;
        }

        var options = {};
        if (frameId || frameId === 0) {
            options.frameId = frameId;
        }

        chrome.tabs.sendMessage(tab.id, {
            command: 'collectPageDetails',
            tab: tab,
            sender: sender
        }, options, function () {
            if (chrome.runtime.lastError) {
                return;
            }
        });
    }

    function addLogin(loginInfo, tab) {
        var loginDomain = bg_utilsService.getDomain(loginInfo.url);
        if (!loginDomain) {
            return;
        }

        bg_cipherService.getAllDecryptedForDomain(loginDomain).then(function (ciphers) {
            var match = false;
            for (var i = 0; i < ciphers.length; i++) {
                if (ciphers[i].login.username === loginInfo.username) {
                    match = true;
                    break;
                }
            }

            if (!match) {
                // remove any old logins for this tab
                removeAddLogin(tab);

                bg_loginsToAdd.push({
                    username: loginInfo.username,
                    password: loginInfo.password,
                    name: loginDomain,
                    domain: loginDomain,
                    uri: loginInfo.url,
                    tabId: tab.id,
                    expires: new Date((new Date()).getTime() + 30 * 60000) // 30 minutes
                });
                checkbg_loginsToAdd(tab);
            }
        });
    }

    function cleanupbg_loginsToAdd() {
        for (var i = bg_loginsToAdd.length - 1; i >= 0; i--) {
            if (bg_loginsToAdd[i].expires < new Date()) {
                bg_loginsToAdd.splice(i, 1);
            }
        }

        setTimeout(cleanupbg_loginsToAdd, 2 * 60 * 1000); // check every 2 minutes
    }

    function removeAddLogin(tab) {
        for (var i = bg_loginsToAdd.length - 1; i >= 0; i--) {
            if (bg_loginsToAdd[i].tabId === tab.id) {
                bg_loginsToAdd.splice(i, 1);
            }
        }
    }

    function saveAddLogin(tab) {
        for (var i = bg_loginsToAdd.length - 1; i >= 0; i--) {
            if (bg_loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            var loginInfo = bg_loginsToAdd[i];
            var tabDomain = bg_utilsService.getDomain(tab.url);
            if (tabDomain && tabDomain !== loginInfo.domain) {
                continue;
            }

            bg_loginsToAdd.splice(i, 1);

            /* jshint ignore:start */
            bg_cipherService.encrypt({
                id: null,
                folderId: null,
                favorite: false,
                name: loginInfo.name,
                notes: null,
                type: bg_constantsService.cipherType.login,
                login: {
                    uri: loginInfo.uri,
                    username: loginInfo.username,
                    password: loginInfo.password
                }
            }).then(function (model) {
                var cipher = new Cipher(model, true);
                return bg_cipherService.saveWithServer(cipher);
            }).then(function (login) {
                ga('send', {
                    hitType: 'event',
                    eventAction: 'Added Login from Notification Bar'
                });
            });
            /* jshint ignore:end */

            messageTab(tab.id, 'closeNotificationBar');
        }
    }

    function saveNever(tab) {
        for (var i = bg_loginsToAdd.length - 1; i >= 0; i--) {
            if (bg_loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            var loginInfo = bg_loginsToAdd[i];
            var tabDomain = bg_utilsService.getDomain(tab.url);
            if (tabDomain && tabDomain !== loginInfo.domain) {
                continue;
            }

            bg_loginsToAdd.splice(i, 1);
            var hostname = bg_utilsService.getHostname(tab.url);
            bg_cipherService.saveNeverDomain(hostname);
            messageTab(tab.id, 'closeNotificationBar');
        }
    }

    function checkbg_loginsToAdd(tab) {
        if (!bg_loginsToAdd.length) {
            return;
        }

        if (tab) {
            check();
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                tab = tabs[0];
                check();
            }
        });

        function check() {
            if (!tab) {
                return;
            }

            var tabDomain = bg_utilsService.getDomain(tab.url);
            if (!tabDomain) {
                return;
            }

            for (var i = 0; i < bg_loginsToAdd.length; i++) {
                if (bg_loginsToAdd[i].tabId !== tab.id || bg_loginsToAdd[i].domain !== tabDomain) {
                    continue;
                }

                messageTab(tab.id, 'openNotificationBar', {
                    type: 'add'
                }, function () { });
                break;
            }
        }
    }

    function startAutofillPage(cipher) {
        loginToAutoFill = cipher;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = null;
            if (tabs.length > 0) {
                tab = tabs[0];
            }
            else {
                return;
            }

            if (!tab) {
                return;
            }

            chrome.tabs.sendMessage(tab.id, {
                command: 'collectPageDetails',
                tab: tab,
                sender: 'contextMenu'
            }, function () { });
        });
    }

    function autofillPage() {
        bg_autofillService.doAutoFill({
            cipher: loginToAutoFill,
            pageDetails: pageDetailsToAutoFill,
            fromBackground: true
        });
        // reset
        loginToAutoFill = null;
        pageDetailsToAutoFill = [];
    }

    function loadLoginContextMenuOptions(cipher) {
        if (!cipher || cipher.type !== bg_constantsService.cipherType.login) {
            return;
        }

        var title = cipher.name + (cipher.login.username && cipher.login.username !== '' ?
            ' (' + cipher.login.username + ')' : '');
        loadContextMenuOptions(title, cipher.id, cipher);
    }

    function loadNoLoginsContextMenuOptions(noLoginsMessage) {
        loadContextMenuOptions(noLoginsMessage, 'noop', null);
    }

    function loadContextMenuOptions(title, idSuffix, cipher) {
        if (!chrome.contextMenus || menuOptionsLoaded.indexOf(idSuffix) > -1 ||
            (cipher && cipher.type !== bg_constantsService.cipherType.login)) {
            return;
        }
        menuOptionsLoaded.push(idSuffix);

        if (!cipher || (cipher.login.password && cipher.login.password !== '')) {
            chrome.contextMenus.create({
                type: 'normal',
                id: 'autofill_' + idSuffix,
                parentId: 'autofill',
                contexts: ['all'],
                title: title
            }, function () {
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        }

        if (bg_utilsService.isFirefox()) {
            // Firefox does not support writing to the clipboard from background
            return;
        }

        if (!cipher || (cipher.login.username && cipher.login.username !== '')) {
            chrome.contextMenus.create({
                type: 'normal',
                id: 'copy-username_' + idSuffix,
                parentId: 'copy-username',
                contexts: ['all'],
                title: title
            }, function () {
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        }

        if (!cipher || (cipher.login.password && cipher.login.password !== '')) {
            chrome.contextMenus.create({
                type: 'normal',
                id: 'copy-password_' + idSuffix,
                parentId: 'copy-password',
                contexts: ['all'],
                title: title
            }, function () {
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        }
    }

    function logout(expired, callback) {
        bg_userService.getUserId().then(function (userId) {
            return Promise.all([
                bg_syncService.setLastSync(new Date(0)),
                bg_tokenService.clearToken(),
                bg_cryptoService.clearKeys(),
                bg_userService.clear(),
                bg_settingsService.clear(userId),
                bg_cipherService.clear(userId),
                bg_folderService.clear(userId),
                bg_passwordGenerationService.clear()
            ]).then(function () {
                chrome.runtime.sendMessage({
                    command: 'doneLoggingOut', expired: expired
                });
                setIcon();
                refreshBadgeAndMenu();
                if (callback) {
                    callback();
                }
            });
        });
    }

    function fullSync(override) {
        override = override || false;
        bg_syncService.getLastSync().then(function (lastSync) {
            var syncInternal = 6 * 60 * 60 * 1000; // 6 hours
            var lastSyncAgo = new Date() - lastSync;
            if (override || !lastSync || lastSyncAgo >= syncInternal) {
                bg_syncService.fullSync(override || false).then(function () {
                    scheduleNextSync();
                });
            }
            else {
                scheduleNextSync();
            }
        });
    }

    function scheduleNextSync() {
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }

        syncTimeout = setTimeout(fullSync, 5 * 60 * 1000); // check every 5 minutes
    }

    // Bootstrap

    bg_environmentService.setUrlsFromStorage().then(function () {
        setIcon();
        cleanupbg_loginsToAdd();
        fullSync(true);
    });
})();
