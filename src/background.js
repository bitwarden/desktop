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
    bg_loginService,
    bg_folderService,
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
    bg_utilsService = new UtilsService();
    bg_i18nService = new i18nService(bg_utilsService);
    bg_constantsService = new ConstantsService(bg_i18nService);
    bg_cryptoService = new CryptoService(bg_constantsService);
    bg_tokenService = new TokenService();
    bg_appIdService = new AppIdService();
    bg_apiService = new ApiService(bg_tokenService, bg_appIdService, bg_utilsService, bg_constantsService, logout);
    bg_environmentService = new EnvironmentService(bg_constantsService, bg_apiService);
    bg_userService = new UserService(bg_tokenService, bg_apiService, bg_cryptoService);
    bg_settingsService = new SettingsService(bg_userService);
    bg_loginService = new LoginService(bg_cryptoService, bg_userService, bg_apiService, bg_settingsService);
    bg_folderService = new FolderService(bg_cryptoService, bg_userService, bg_apiService, bg_i18nService);
    bg_lockService = new LockService(bg_constantsService, bg_cryptoService, bg_folderService, bg_loginService, bg_utilsService,
        setIcon, refreshBadgeAndMenu);
    bg_syncService = new SyncService(bg_loginService, bg_folderService, bg_userService, bg_apiService, bg_settingsService,
        bg_cryptoService, logout);
    bg_passwordGenerationService = new PasswordGenerationService();
    bg_totpService = new TotpService(bg_constantsService);
    bg_autofillService = new AutofillService(bg_utilsService, bg_totpService, bg_tokenService, bg_loginService);

    if (chrome.commands) {
        chrome.commands.onCommand.addListener(function (command) {
            if (command === 'generate_password') {
                ga('send', {
                    hitType: 'event',
                    eventAction: 'Generated Password From Command'
                });
                bg_passwordGenerationService.getOptions().then(function (options) {
                    var password = bg_passwordGenerationService.generatePassword(options);
                    bg_utilsService.copyToClipboard(password);
                });
            }
            else if (command === 'autofill_login') {
                chrome.tabs.query({ active: true }, function (tabs) {
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
            collectPageDetailsForContentScript(sender.tab, msg.sender);
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
                }]);
            }
            else {
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
                    var password = bg_passwordGenerationService.generatePassword(options);
                    bg_utilsService.copyToClipboard(password);
                });
            }
            else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
                info.parentMenuItemId === 'copy-password') {
                var id = info.menuItemId.split('_')[1];
                if (id === 'noop') {
                    return;
                }

                bg_loginService.getAllDecrypted().then(function (logins) {
                    for (var i = 0; i < logins.length; i++) {
                        if (logins[i].id === id) {
                            if (info.parentMenuItemId === 'autofill') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Autofilled From Context Menu'
                                });
                                startAutofillPage(logins[i]);
                            }
                            else if (info.parentMenuItemId === 'copy-username') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Username From Context Menu'
                                });
                                bg_utilsService.copyToClipboard(logins[i].username);
                            }
                            else if (info.parentMenuItemId === 'copy-password') {
                                ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Password From Context Menu'
                                });
                                bg_utilsService.copyToClipboard(logins[i].password);
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
                    bg_loginService.getAllDecryptedForDomain(domain).then(function (logins) {
                        if (!logins || logins.length !== 1) {
                            reject();
                            return;
                        }

                        resolve({
                            authCredentials: {
                                username: logins[0].username,
                                password: logins[0].password
                            }
                        });
                    }, function () {
                        reject();
                    });
                });
            }
            else {
                bg_loginService.getAllDecryptedForDomain(domain).then(function (logins) {
                    if (!logins || logins.length !== 1) {
                        callback();
                        return;
                    }

                    callback({
                        authCredentials: {
                            username: logins[0].username,
                            password: logins[0].password
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

        bg_userService.isAuthenticated(function (isAuthenticated) {
            bg_cryptoService.getKey().then(function (key) {
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
        bg_loginService.getAllDecryptedForDomain(tabDomain).then(function (logins) {
            logins.sort(bg_loginService.sortLoginsByLastUsedThenName);

            if (contextMenuEnabled) {
                for (var i = 0; i < logins.length; i++) {
                    loadLoginContextMenuOptions(logins[i]);
                }
            }

            var theText = '';
            if (logins.length > 0 && logins.length < 9) {
                theText = logins.length.toString();
            }
            else if (logins.length > 0) {
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

    function collectPageDetailsForContentScript(tab, sender) {
        if (!tab || !tab.id) {
            return;
        }

        chrome.tabs.sendMessage(tab.id, { command: 'collectPageDetails', tab: tab, sender: sender }, function () {
            if (chrome.runtime.lastError) {
                return;
            }
        });
    }

    function addLogin(login, tab) {
        var loginDomain = bg_utilsService.getDomain(login.url);
        if (!loginDomain) {
            return;
        }

        bg_loginService.getAllDecryptedForDomain(loginDomain).then(function (logins) {
            var match = false;
            for (var i = 0; i < logins.length; i++) {
                if (logins[i].username === login.username) {
                    match = true;
                    break;
                }
            }

            if (!match) {
                // remove any old logins for this tab
                removeAddLogin(tab);

                bg_loginsToAdd.push({
                    username: login.username,
                    password: login.password,
                    name: loginDomain,
                    domain: loginDomain,
                    uri: login.url,
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
            if (bg_loginsToAdd[i].tabId === tab.id) {
                var loginToAdd = bg_loginsToAdd[i];

                var tabDomain = bg_utilsService.getDomain(tab.url);
                if (tabDomain && tabDomain === loginToAdd.domain) {
                    bg_loginsToAdd.splice(i, 1);

                    /* jshint ignore:start */
                    bg_loginService.encrypt({
                        id: null,
                        folderId: null,
                        favorite: false,
                        name: loginToAdd.name,
                        uri: loginToAdd.uri,
                        username: loginToAdd.username,
                        password: loginToAdd.password,
                        notes: null
                    }).then(function (loginModel) {
                        var login = new Login(loginModel, true);
                        bg_loginService.saveWithServer(login).then(function (login) {
                            ga('send', {
                                hitType: 'event',
                                eventAction: 'Added Login from Notification Bar'
                            });
                        });
                    });
                    /* jshint ignore:end */

                    messageTab(tab.id, 'closeNotificationBar');
                }
            }
        }
    }

    function saveNever(tab) {
        for (var i = bg_loginsToAdd.length - 1; i >= 0; i--) {
            if (bg_loginsToAdd[i].tabId === tab.id) {
                var loginToAdd = bg_loginsToAdd[i];

                var tabDomain = bg_utilsService.getDomain(tab.url);
                if (tabDomain && tabDomain === loginToAdd.domain) {
                    bg_loginsToAdd.splice(i, 1);
                    var hostname = bg_utilsService.getHostname(tab.url);
                    bg_loginService.saveNeverDomain(hostname);
                    messageTab(tab.id, 'closeNotificationBar');
                }
            }
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
                if (bg_loginsToAdd[i].tabId === tab.id && bg_loginsToAdd[i].domain === tabDomain) {
                    messageTab(tab.id, 'openNotificationBar', {
                        type: 'add'
                    }, function () { });
                    break;
                }
            }
        }
    }

    function startAutofillPage(login) {
        loginToAutoFill = login;
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

            chrome.tabs.sendMessage(tab.id, { command: 'collectPageDetails', tab: tab, sender: 'contextMenu' }, function () {
            });
        });
    }

    function autofillPage() {
        bg_autofillService.doAutoFill(loginToAutoFill, pageDetailsToAutoFill, true);
        // reset
        loginToAutoFill = null;
        pageDetailsToAutoFill = [];
    }

    function loadLoginContextMenuOptions(login) {
        var title = login.name + (login.username && login.username !== '' ? ' (' + login.username + ')' : '');
        loadContextMenuOptions(title, login.id, login);
    }

    function loadNoLoginsContextMenuOptions(noLoginsMessage) {
        loadContextMenuOptions(noLoginsMessage, 'noop', null);
    }

    function loadContextMenuOptions(title, idSuffix, login) {
        if (!chrome.contextMenus || menuOptionsLoaded.indexOf(idSuffix) > -1) {
            return;
        }
        menuOptionsLoaded.push(idSuffix);

        if (!login || (login.password && login.password !== '')) {
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

        if (!login || (login.username && login.username !== '')) {
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

        if (!login || (login.password && login.password !== '')) {
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

    // TODO: Fix callback hell by moving to promises
    function logout(expired, callback) {
        bg_userService.getUserId(function (userId) {
            bg_syncService.setLastSync(new Date(0), function () {
                bg_settingsService.clear(function () {
                    bg_tokenService.clearToken(function () {
                        bg_cryptoService.clearKeys(function () {
                            bg_userService.clear(function () {
                                bg_loginService.clear(userId, function () {
                                    bg_folderService.clear(userId, function () {
                                        chrome.runtime.sendMessage({
                                            command: 'doneLoggingOut', expired: expired
                                        });
                                        setIcon();
                                        refreshBadgeAndMenu();
                                        callback();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    function fullSync(override) {
        override = override || false;
        bg_syncService.getLastSync(function (lastSync) {
            var syncInternal = 6 * 60 * 60 * 1000; // 6 hours
            var lastSyncAgo = new Date() - lastSync;
            if (override || !lastSync || lastSyncAgo >= syncInternal) {
                bg_syncService.fullSync(override || false, function () {
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

    bg_environmentService.setUrlsFromStorage(function () {
        setIcon();
        cleanupbg_loginsToAdd();
        fullSync(true);
    });
})();
