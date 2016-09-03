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
    });
