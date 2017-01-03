angular
    .module('bit.services')

    .factory('tokenService', function () {
        return chrome.extension.getBackgroundPage().tokenService;
    })
    .factory('cryptoService', function () {
        return chrome.extension.getBackgroundPage().cryptoService;
    })
    .factory('userService', function () {
        return chrome.extension.getBackgroundPage().userService;
    })
    .factory('apiService', function () {
        return chrome.extension.getBackgroundPage().apiService;
    })
    .factory('folderService', function () {
        return chrome.extension.getBackgroundPage().folderService;
    })
    .factory('loginService', function () {
        return chrome.extension.getBackgroundPage().loginService;
    })
    .factory('syncService', function () {
        return chrome.extension.getBackgroundPage().syncService;
    })
    .factory('tldjs', function () {
        return chrome.extension.getBackgroundPage().tldjs;
    })
    .factory('autofillService', function () {
        return chrome.extension.getBackgroundPage().autofillService;
    })
    .factory('passwordGenerationService', function () {
        return chrome.extension.getBackgroundPage().passwordGenerationService;
    })
    .factory('utilsService', function () {
        return chrome.extension.getBackgroundPage().utilsService;
    })
    .factory('appIdService', function () {
        return chrome.extension.getBackgroundPage().appIdService;
    })
    .factory('i18nService', function () {
        return chrome.extension.getBackgroundPage().i18nService;
    })
    .factory('constantsService', function () {
        return chrome.extension.getBackgroundPage().constantsService;
    });
