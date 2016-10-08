var isBackground = true;
var utilsService = new UtilsService();
var cryptoService = new CryptoService();
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

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.command === 'loggedOut') {
        setIcon(true);
        refreshBadgeAndMenu();
    }
    else if (msg.command === 'loggedIn') {
        setIcon(false);
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
});

userService.isAuthenticated(function (isAuthenticated) {
    setIcon(!isAuthenticated);
});

function setIcon(grayedOut) {
    var suffix = '';
    if (grayedOut) {
        suffix = '_gray';
    }

    chrome.browserAction.setIcon({
        path: {
            '19': 'images/icon19' + suffix + '.png',
            '38': 'images/icon38' + suffix + '.png',
        }
    });
}

if (chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(function (details) {
        ga('send', {
            hitType: 'event',
            eventAction: 'onInstalled ' + details.reason
        });
    });
}

function buildContextMenu() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        type: 'normal',
        id: 'autofill',
        contexts: ['all'],
        title: 'Auto-fill'
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-username',
        contexts: ['all'],
        title: 'Copy Username'
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-password',
        contexts: ['all'],
        title: 'Copy Password'
    });

    chrome.contextMenus.create({
        type: 'separator'
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'generate-password',
        contexts: ['all'],
        title: 'Generate Password (copied)'
    });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    buildContextMenu();
    refreshBadgeAndMenu();
});

var loadedMenu = false;
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
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

        buildContextMenu();
        loadMenuAndUpdateBadge(tab.url, tab.id, true);
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    buildContextMenu();
    loadMenuAndUpdateBadge(tab.url, tabId, true);
});

function loadMenuAndUpdateBadge(url, tabId, loadContextMenuOptions) {
    loadedMenu = false;
    if (!url) {
        return;
    }

    var tabDomain = tldjs.getDomain(url);
    if (!tabDomain) {
        return;
    }

    var count = 0;
    chrome.browserAction.setBadgeBackgroundColor({ color: '#294e5f' });

    siteService.getAllDecrypted().then(function (sites) {
        if (loadedMenu) {
            return;
        }
        loadedMenu = true;

        sortSites(sites);
        for (var i = 0; i < sites.length; i++) {
            if (sites[i].domain && tabDomain === sites[i].domain) {
                count++;

                if (loadContextMenuOptions) {
                    loadSiteContextMenuOptions(sites[i]);
                }
            }
        }

        if (count > 0 && count < 9) {
            chrome.browserAction.setBadgeText({
                text: count.toString(),
                tabId: tabId
            });
        }
        else if (count > 0) {
            chrome.browserAction.setBadgeText({
                text: '9+',
                tabId: tabId
            });
        }
        else {
            loadNoSitesContextMenuOptions();
            chrome.browserAction.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
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
                        autofillPage(sites[i]);
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
    });
}

function autofillPage(site) {
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

        chrome.tabs.sendMessage(tabId, { command: 'collectPageDetails' }, function (pageDetails) {
            var fillScript = null;
            if (site && pageDetails) {
                fillScript = autofillService.generateFillScript(pageDetails, site.username, site.password);
            }

            if (tabId && fillScript && fillScript.script) {
                chrome.tabs.sendMessage(tabId, {
                    command: 'fillForm',
                    fillScript: fillScript
                });
            }
        });
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

function buildContextMenuOptions(url) {
    var tabDomain = tldjs.getDomain(url);
    if (!tabDomain) {
        return;
    }

    siteService.getAllDecrypted().then(function (sites) {
        var count = 0;
        if (sites && sites.length) {
            sortSites(sites);
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].domain && tabDomain === sites[i].domain) {
                    count++;
                    loadSiteContextMenuOptions(sites[i]);
                }
            }
        }

        if (!count) {
            loadNoSitesContextMenuOptions();
        }
    });
}

function loadSiteContextMenuOptions(site) {
    var title = site.name + ' (' + site.username + ')';
    loadContextMenuOptions(title, site.id);
}

function loadNoSitesContextMenuOptions() {
    var title = 'No matching sites.';
    loadContextMenuOptions(title, 'noop');
}

function loadContextMenuOptions(title, idSuffix) {
    chrome.contextMenus.create({
        type: 'normal',
        id: 'autofill_' + idSuffix,
        parentId: 'autofill',
        contexts: ['all'],
        title: title
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-username_' + idSuffix,
        parentId: 'copy-username',
        contexts: ['all'],
        title: title
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-password_' + idSuffix,
        parentId: 'copy-password',
        contexts: ['all'],
        title: title
    });
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
