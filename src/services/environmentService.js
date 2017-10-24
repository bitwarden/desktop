function EnvironmentService(constantsService, apiService) {
    this.constantsService = constantsService;
    this.apiService = apiService;

    this.baseUrl = null;
    this.webVaultUrl = null;
    this.apiUrl = null;
    this.identityUrl = null;
    this.iconsUrl = null;

    initEnvironmentService();
}

function initEnvironmentService() {
    EnvironmentService.prototype.setUrlsFromStorage = function (callback) {
        var self = this;

        chrome.storage.local.get(self.constantsService.environmentUrlsKey, function (urlsObj) {
            var urls = urlsObj[self.constantsService.environmentUrlsKey] || {
                base: null,
                api: null,
                identity: null,
                icons: null,
                webVault: null
            };

            self.baseUrl = urls.base;
            if (self.baseUrl) {
                self.apiService.setUrls({
                    base: self.baseUrl
                });
                callback();
                return;
            }

            self.webVaultUrl = urls.webVault;
            self.apiUrl = urls.api;
            self.identityUrl = urls.identity;
            self.iconsUrl = urls.icons;

            self.apiService.setUrls({
                api: self.apiUrl,
                identity: self.identityUrl
            });
            callback();
            return;
        });
    };

    EnvironmentService.prototype.setUrls = function (urls, callback) {
        var self = this;

        urls.base = formatUrl(urls.base);
        urls.webVault = formatUrl(urls.webVault);
        urls.api = formatUrl(urls.api);
        urls.identity = formatUrl(urls.identity);
        urls.icons = formatUrl(urls.icons);

        var urlsObj = {};
        urlsObj[self.constantsService.environmentUrlsKey] = {
            base: urls.base,
            api: urls.api,
            identity: urls.identity,
            webVault: urls.webVault,
            icons: urls.icons
        };

        chrome.storage.local.set(urlsObj, function () {
            self.baseUrl = urls.base;
            self.webVaultUrl = urls.webVault;
            self.apiUrl = urls.api;
            self.identityUrl = urls.identity;
            self.iconsUrl = urls.icons;

            if (self.baseUrl) {
                self.apiService.setUrls({
                    base: self.baseUrl
                });
            }
            else {
                self.apiService.setUrls({
                    api: self.apiUrl,
                    identity: self.identityUrl
                });
            }

            callback(urls);
        });
    };

    function formatUrl(url) {
        if (!url || url === '') {
            return null;
        }

        url = url.replace(/\/+$/g, '');
        if (!url.startsWith("http://") && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        return url;
    }
}
