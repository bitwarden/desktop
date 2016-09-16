var cryptoService = new CryptoService();
var tokenService = new TokenService();
var apiService = new ApiService(tokenService);
var userService = new UserService(tokenService, apiService);
var siteService = new SiteService(cryptoService, userService, apiService);
var folderService = new FolderService(cryptoService, userService, apiService);
var syncService = new SyncService(siteService, folderService, userService, apiService);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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
        for (var i = 0; i < sites.length; i++) {
            if (sites[i].domain && tabDomain == sites[i].domain) {
                count++;
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
    });
});
