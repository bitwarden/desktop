var isBackground = true;
var loginsToAdd = [];
var i18nService = new i18nService();
var constantsService = new ConstantsService();
var utilsService = new UtilsService();
var cryptoService = new CryptoService(constantsService);
var tokenService = new TokenService();
var apiService = new ApiService(tokenService);
var userService = new UserService(tokenService, apiService, cryptoService);
var siteService = new SiteService(cryptoService, userService, apiService);
var folderService = new FolderService(cryptoService, userService, apiService);
var syncService = new SyncService(siteService, folderService, userService, apiService);
var autofillService = new AutofillService();
var passwordGenerationService = new PasswordGenerationService();
var appIdService = new AppIdService();

chrome.commands.onCommand.addListener(function (command) {
    if (command === 'generate_password') {
        ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Command'
        });
        passwordGenerationService.getOptions().then(function (options) {
            var password = passwordGenerationService.generatePassword(options);
            copyToClipboard(password);
        });
    }
});

var loadMenuRan = false,
    siteToAutoFill = null,
    pageDetailsToAutoFill = [],
    autofillTimeout = null;

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.command === 'loggedOut' || msg.command === 'loggedIn' || msg.command === 'unlocked' || msg.command === 'locked') {
        if (loadMenuRan) {
            return;
        }
        loadMenuRan = true;

        setIcon();
        refreshBadgeAndMenu();
    }
    else if (msg.command === 'syncCompleted' && msg.successfully) {
        if (loadMenuRan) {
            return;
        }
        loadMenuRan = true;

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
    else if (msg.command === 'bgCollectPageDetails') {
        collectPageDetailsForContentScript(sender.tab);
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
    else if (msg.command === 'collectPageDetailsResponse') {
        // messageCurrentTab('openNotificationBar', { type: 'add', typeData: null });
        if (msg.contentScript) {
            var forms = autofillService.getFormsWithPasswordFields(msg.details);
            messageTab(msg.tabId, 'pageDetails', { details: msg.details, forms: forms });
        }
        else {
            clearTimeout(autofillTimeout);
            pageDetailsToAutoFill.push({ frameId: sender.frameId, tabId: msg.tabId, details: msg.details });
            autofillTimeout = setTimeout(autofillPage, 300);
        }
    }
});

setIcon();
function setIcon() {
    userService.isAuthenticated(function (isAuthenticated) {
        cryptoService.getKey(false, function (key) {
            var suffix = '';
            if (!isAuthenticated) {
                suffix = '_gray';
            }
            else if (!key) {
                suffix = '_locked';
            }

            chrome.browserAction.setIcon({
                path: {
                    '19': 'images/icon19' + suffix + '.png',
                    '38': 'images/icon38' + suffix + '.png',
                }
            });
        });
    });
}

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

function buildContextMenu(callback) {
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
                title: i18nService.autoFill
            }, function () {
                chrome.contextMenus.create({
                    type: 'normal',
                    id: 'copy-username',
                    parentId: 'root',
                    contexts: ['all'],
                    title: i18nService.copyUsername
                }, function () {
                    chrome.contextMenus.create({
                        type: 'normal',
                        id: 'copy-password',
                        parentId: 'root',
                        contexts: ['all'],
                        title: i18nService.copyPassword
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
                            title: i18nService.generatePasswordCopied
                        }, function () {
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

chrome.tabs.onActivated.addListener(function (activeInfo) {
    checkLoginsToAdd();
    refreshBadgeAndMenu();
});

var onReplacedRan = false;
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    if (onReplacedRan) {
        return;
    }
    onReplacedRan = true;
    checkLoginsToAdd();
    refreshBadgeAndMenu();
});

var onUpdatedRan = false;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (onUpdatedRan) {
        return;
    }
    onUpdatedRan = true;
    checkLoginsToAdd();
    refreshBadgeAndMenu();
});

function refreshBadgeAndMenu() {
    chrome.tabs.query({ active: true }, function (tabs) {
        var tab = null;
        if (tabs.length > 0) {
            tab = tabs[0];
        }

        if (!tab) {
            return;
        }

        buildContextMenu(function () {
            loadMenuAndUpdateBadge(tab.url, tab.id, true);
            onUpdatedRan = onReplacedRan = loadMenuRan = false;
        });
    });
}

function loadMenuAndUpdateBadge(url, tabId, loadContextMenuOptions) {
    if (!url) {
        return;
    }

    var tabDomain = tldjs.getDomain(url);
    if (!tabDomain) {
        return;
    }

    chrome.browserAction.setBadgeBackgroundColor({ color: '#294e5f' });

    siteService.getAllDecryptedForDomain(tabDomain).then(function (sites) {
        sortSites(sites);
        for (var i = 0; i < sites.length; i++) {
            if (loadContextMenuOptions) {
                loadSiteContextMenuOptions(sites[i]);
            }
        }

        if (sites.length > 0 && sites.length < 9) {
            chrome.browserAction.setBadgeText({
                text: sites.length.toString(),
                tabId: tabId
            });
        }
        else if (sites.length > 0) {
            chrome.browserAction.setBadgeText({
                text: '9+',
                tabId: tabId
            });
        }
        else {
            loadNoSitesContextMenuOptions(i18nService.noMatchingSites);
            chrome.browserAction.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    }, function () {
        loadNoSitesContextMenuOptions(i18nService.vaultLocked);
        chrome.browserAction.setBadgeText({
            text: '',
            tabId: tabId
        });
    });
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'generate-password') {
        ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Context Menu'
        });
        passwordGenerationService.getOptions().then(function (options) {
            var password = passwordGenerationService.generatePassword(options);
            copyToClipboard(password);
        });
    }
    else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
        info.parentMenuItemId === 'copy-password') {
        var id = info.menuItemId.split('_')[1];
        if (id === 'noop') {
            return;
        }

        siteService.getAllDecrypted().then(function (sites) {
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].id === id) {
                    if (info.parentMenuItemId === 'autofill') {
                        ga('send', {
                            hitType: 'event',
                            eventAction: 'Autofilled From Context Menu'
                        });
                        startAutofillPage(sites[i]);
                    }
                    else if (info.parentMenuItemId === 'copy-username') {
                        ga('send', {
                            hitType: 'event',
                            eventAction: 'Copied Username From Context Menu'
                        });
                        copyToClipboard(sites[i].username);
                    }
                    else if (info.parentMenuItemId === 'copy-password') {
                        ga('send', {
                            hitType: 'event',
                            eventAction: 'Copied Password From Context Menu'
                        });
                        copyToClipboard(sites[i].password);
                    }
                    return;
                }
            }
        }, function () {

        });
    }
});

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

function messageTab(tabId, command, data) {
    if (!tabId) {
        return;
    }

    var obj = {
        command: command
    };

    if (data) {
        obj['data'] = data;
    }

    chrome.tabs.sendMessage(tabId, obj);
}

function collectPageDetailsForContentScript(tab) {
    chrome.tabs.sendMessage(tab.id, { command: 'collectPageDetails', tabId: tab.id, contentScript: true }, function () { });
}

function addLogin(login, tab) {
    var loginDomain = tldjs.getDomain(login.url);
    if (!loginDomain) {
        return;
    }

    siteService.getAllDecryptedForDomain(loginDomain).then(function (sites) {
        var match = false;
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] === login.username) {
                match = true;
                break;
            }
        }

        if (!match) {
            // remove any old logins for this tab
            removeAddLogin(tab);

            loginsToAdd.push({
                username: login.username,
                password: login.password,
                name: loginDomain,
                uri: login.url,
                tabId: tab.id,
                expires: new Date((new Date()).getTime() + 30 * 60000) // 30 minutes
            });
            checkLoginsToAdd();
        }
    });
}

cleanupLoginsToAdd();
setInterval(cleanupLoginsToAdd, 2 * 60 * 1000); // check every 2 minutes
function cleanupLoginsToAdd() {
    var now = new Date();
    for (var i = loginsToAdd.length - 1; i >= 0 ; i--) {
        if (loginsToAdd[i].expires < now) {
            loginsToAdd.splice(i, 1);
        }
    }
}

function removeAddLogin(tab) {
    for (var i = loginsToAdd.length - 1; i >= 0 ; i--) {
        if (loginsToAdd[i].tabId === tab.id) {
            loginsToAdd.splice(i, 1);
        }
    }
}

function saveAddLogin(tab) {
    for (var i = loginsToAdd.length - 1; i >= 0 ; i--) {
        if (loginsToAdd[i].tabId === tab.id) {
            var loginToAdd = loginsToAdd[i];
            loginsToAdd.splice(i, 1);
            siteService.encrypt({
                id: null,
                folderId: null,
                favorite: false,
                name: loginToAdd.name,
                uri: loginToAdd.uri,
                username: loginToAdd.username,
                password: loginToAdd.password,
                notes: null
            }).then(function (siteModel) {
                var site = new Site(siteModel, true);
                siteService.saveWithServer(site).then(function (site) {
                    ga('send', {
                        hitType: 'event',
                        eventAction: 'Added Site from Notification Bar'
                    });
                });
            });
            messageTab(tab.id, 'closeNotificationBar');
        }
    }
}

function checkLoginsToAdd() {
    if (!loginsToAdd.length) {
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tabId = null;
        if (tabs.length > 0) {
            tabId = tabs[0].id;
        }
        else {
            return;
        }

        if (!tabId) {
            return;
        }

        var tabDomain = tldjs.getDomain(tabs[0].url);
        if (!tabDomain) {
            return;
        }

        for (var i = 0; i < loginsToAdd.length; i++) {
            if (loginsToAdd[i].tabId === tabId && loginsToAdd[i].name === tabDomain) {
                messageTab(tabId, 'openNotificationBar', { type: 'add' });
                break;
            }
        }
    });
}

function startAutofillPage(site) {
    siteToAutoFill = site;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tabId = null;
        if (tabs.length > 0) {
            tabId = tabs[0].id;
        }
        else {
            return;
        }

        if (!tabId) {
            return;
        }

        chrome.tabs.sendMessage(tabId, { command: 'collectPageDetails', tabId: tabId }, function () { });
    });
}

function autofillPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tabId = null;
        if (tabs.length > 0) {
            tabId = tabs[0].id;
        }
        else {
            return;
        }

        if (!tabId) {
            return;
        }

        if (siteToAutoFill && pageDetailsToAutoFill && pageDetailsToAutoFill.length) {
            for (var i = 0; i < pageDetailsToAutoFill.length; i++) {
                // make sure we're still on correct tab
                if (pageDetailsToAutoFill[i].tabId !== tabId) {
                    continue;
                }

                var fillScript = autofillService.generateFillScript(pageDetailsToAutoFill[i].details, siteToAutoFill.username,
                    siteToAutoFill.password);
                if (tabId && fillScript && fillScript.script && fillScript.script.length) {
                    chrome.tabs.sendMessage(tabId, {
                        command: 'fillForm',
                        fillScript: fillScript
                    }, {
                        frameId: pageDetailsToAutoFill[i].frameId
                    });
                }
            }
        }

        // reset
        siteToAutoFill = null;
        pageDetailsToAutoFill = [];
    });
}

function sortSites(sites) {
    sites.sort(function (a, b) {
        var nameA = (a.name + '_' + a.username).toUpperCase();
        var nameB = (b.name + '_' + b.username).toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        return 0;
    });
}

function loadSiteContextMenuOptions(site) {
    var title = site.name + (site.username && site.username !== '' ? ' (' + site.username + ')' : '');
    loadContextMenuOptions(title, site.id, site);
}

function loadNoSitesContextMenuOptions(noSitesMessage) {
    loadContextMenuOptions(noSitesMessage, 'noop', null);
}

function loadContextMenuOptions(title, idSuffix, site) {
    if (!site || (site.password && site.password !== '')) {
        chrome.contextMenus.create({
            type: 'normal',
            id: 'autofill_' + idSuffix,
            parentId: 'autofill',
            contexts: ['all'],
            title: title
        });
    }

    if (!site || (site.username && site.username !== '')) {
        chrome.contextMenus.create({
            type: 'normal',
            id: 'copy-username_' + idSuffix,
            parentId: 'copy-username',
            contexts: ['all'],
            title: title
        });
    }

    if (!site || (site.password && site.password !== '')) {
        chrome.contextMenus.create({
            type: 'normal',
            id: 'copy-password_' + idSuffix,
            parentId: 'copy-password',
            contexts: ['all'],
            title: title
        });
    }
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData('Text', text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        var textarea = document.createElement('textarea');
        textarea.textContent = text;
        // Prevent scrolling to bottom of page in MS Edge.
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            // Security exception may be thrown by some browsers.
            return document.execCommand('copy');
        }
        catch (ex) {
            console.warn('Copy to clipboard failed.', ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

// Sync polling

fullSync(true);
setInterval(fullSync, 5 * 60 * 1000); // check every 5 minutes
var syncInternal = 6 * 60 * 60 * 1000; // 6 hours

function fullSync(override) {
    syncService.getLastSync(function (lastSync) {
        var now = new Date();
        if (override || !lastSync || (now - lastSync) >= syncInternal) {
            syncService.fullSync(function () { });
        }
    });
}

// Locking

checkLock();
setInterval(checkLock, 10 * 1000); // check every 10 seconds

function checkLock() {
    if (chrome.extension.getViews({ type: 'popup' }).length > 0) {
        // popup is open, do not lock
        return;
    }

    cryptoService.getKey(false, function (key) {
        if (!key) {
            // no key so no need to lock
            return;
        }

        chrome.storage.local.get(constantsService.lockOptionKey, function (obj) {
            if (obj && ((!obj[constantsService.lockOptionKey] && obj[constantsService.lockOptionKey] !== 0) ||
                obj[constantsService.lockOptionKey] === -1)) {
                // no lock option set
                return;
            }

            chrome.storage.local.get(constantsService.lastActiveKey, function (obj2) {
                if (obj2 && obj2[constantsService.lastActiveKey]) {
                    var lastActive = obj2[constantsService.lastActiveKey];
                    var diffSeconds = ((new Date()).getTime() - lastActive) / 1000;
                    var lockOptionSeconds = parseInt(obj[constantsService.lockOptionKey]) * 60;

                    if (diffSeconds >= lockOptionSeconds) {
                        // need to lock now
                        cryptoService.clearKey(function () {
                            setIcon();
                            folderService.clearCache();
                            siteService.clearCache();
                            refreshBadgeAndMenu();
                        });
                    }
                }
            });
        });
    });
};
