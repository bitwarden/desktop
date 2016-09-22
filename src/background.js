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
        type: 'separator',
        contexts: ['all']
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'generate-password',
        contexts: ['all'],
        title: 'Generate Password'
    });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    buildContextMenu();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = null;
        if (tabs.length > 0) {
            tab = tabs[0];
        }

        if (!tab || !tab.url) {
            return;
        }

        buildContextMenuOptions(tab.url);
    });
});

var loadedMenuOnUpdate = false;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    loadedMenuOnUpdate = false;
    buildContextMenu();

    if (!tab.url) {
        return;
    }

    var tabDomain = tldjs.getDomain(tab.url);
    if (!tabDomain) {
        return;
    }

    var count = 0;
    chrome.browserAction.setBadgeBackgroundColor({ color: '#294e5f' });

    siteService.getAllDecrypted().then(function (sites) {
        if (loadedMenuOnUpdate) {
            return;
        }
        loadedMenuOnUpdate = true;

        sortSites(sites);
        for (var i = 0; i < sites.length; i++) {
            if (sites[i].domain && tabDomain === sites[i].domain) {
                count++;
                loadContextMenuOptions(sites[i]);
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
            chrome.browserAction.setBadgeText({
                text: null,
                tabId: tabId
            });
        }
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
        info.parentMenuItemId === 'copy-password') {
        var id = info.menuItemId.split('_')[1];
        siteService.getAllDecrypted().then(function (sites) {
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].id === id) {
                    if (info.parentMenuItemId === 'autofill') {
                        autofillPage(sites[i]);
                    }
                    else if (info.parentMenuItemId === 'copy-username') {
                        copyToClipboard(sites[i].username);
                    }
                    else if (info.parentMenuItemId === 'copy-password') {
                        copyToClipboard(sites[i].password);
                    }
                    return;
                }
            }
        });
    }
});

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

            if (tabId && fillScript) {
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
        sortSites(sites);
        for (var i = 0; i < sites.length; i++) {
            if (sites[i].domain && tabDomain === sites[i].domain) {
                loadContextMenuOptions(sites[i]);
            }
        }
    });
}

function loadContextMenuOptions(site) {
    var title = site.name + ' (' + site.username + ')';
    chrome.contextMenus.create({
        type: 'normal',
        id: 'autofill_' + site.id,
        parentId: 'autofill',
        contexts: ['all'],
        title: title
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-username_' + site.id,
        parentId: 'copy-username',
        contexts: ['all'],
        title: title
    });

    chrome.contextMenus.create({
        type: 'normal',
        id: 'copy-password_' + site.id,
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
