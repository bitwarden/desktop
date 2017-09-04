angular
    .module('bit.services')

    .factory('tokenService', function () {
        return chrome.extension.getBackgroundPage().bg_tokenService;
    })
    .factory('cryptoService', function () {
        return chrome.extension.getBackgroundPage().bg_cryptoService;
    })
    .factory('userService', function () {
        return chrome.extension.getBackgroundPage().bg_userService;
    })
    .factory('apiService', function () {
        return chrome.extension.getBackgroundPage().bg_apiService;
    })
    .factory('folderService', function () {
        return chrome.extension.getBackgroundPage().bg_folderService;
    })
    .factory('loginService', function () {
        return chrome.extension.getBackgroundPage().bg_loginService;
    })
    .factory('syncService', function () {
        return chrome.extension.getBackgroundPage().bg_syncService;
    })
    .factory('autofillService', function () {
        return chrome.extension.getBackgroundPage().bg_autofillService;
    })
    .factory('passwordGenerationService', function () {
        return chrome.extension.getBackgroundPage().bg_passwordGenerationService;
    })
    .factory('utilsService', function () {
        return chrome.extension.getBackgroundPage().bg_utilsService;
    })
    .factory('appIdService', function () {
        return chrome.extension.getBackgroundPage().bg_appIdService;
    })
    .factory('i18nService', function () {
        return chrome.extension.getBackgroundPage().bg_i18nService;
    })
    .factory('constantsService', function () {
        return chrome.extension.getBackgroundPage().bg_constantsService;
    })
    .factory('settingsService', function () {
        return chrome.extension.getBackgroundPage().bg_settingsService;
    })
    .factory('lockService', function () {
        return chrome.extension.getBackgroundPage().bg_lockService;
    })
    .factory('totpService', function () {
        return chrome.extension.getBackgroundPage().bg_totpService;
    })
    .factory('environmentService', function () {
        return chrome.extension.getBackgroundPage().bg_environmentService;
    });
