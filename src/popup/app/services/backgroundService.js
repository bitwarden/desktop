angular
    .module('bit.services')

    .factory('tokenService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_tokenService : null;
    })
    .factory('cryptoService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_cryptoService : null;
    })
    .factory('userService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_userService : null;
    })
    .factory('apiService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_apiService : null;
    })
    .factory('folderService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_folderService : null;
    })
    .factory('cipherService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_cipherService : null;
    })
    .factory('syncService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_syncService : null;
    })
    .factory('autofillService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_autofillService : null;
    })
    .factory('passwordGenerationService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_passwordGenerationService : null;
    })
    .factory('utilsService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_utilsService : null;
    })
    .factory('appIdService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_appIdService : null;
    })
    .factory('i18nService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_i18nService : null;
    })
    .factory('constantsService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_constantsService : null;
    })
    .factory('settingsService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_settingsService : null;
    })
    .factory('lockService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_lockService : null;
    })
    .factory('totpService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_totpService : null;
    })
    .factory('environmentService', function () {
        var page = chrome.extension.getBackgroundPage();
        return page ? page.bg_environmentService : null;
    });
