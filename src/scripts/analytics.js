var gaTrackingId = chrome.extension.getBackgroundPage().utilsService.analyticsId();
var gaFunc = null;

window.GoogleAnalyticsObject = 'ga';
window[window.GoogleAnalyticsObject] = function (action, param1, param2, param3, param4) {
    if (!gaFunc) {
        return;
    }

    chrome.storage.local.get('disableGa', function (obj) {
        if (obj && obj['disableGa']) {
            return;
        }

        gaFunc(action, param1, param2, param3, param4);
    });
};

function gaTrackEvent(options) {
    return '&t=event&ec=' + (options.eventCategory ? encodeURIComponent(options.eventCategory) : 'Event') +
        '&ea=' + encodeURIComponent(options.eventAction) +
        (options.eventLabel ? '&el=' + encodeURIComponent(options.eventLabel) : '') +
        (options.eventValue ? '&ev=' + encodeURIComponent(options.eventValue) : '') +
        (options.page ? '&dp=' + encodeURIComponent(options.page) : '');
}

function gaTrackPageView(pagePath) {
    return '&t=pageview&dp=' + encodeURIComponent(pagePath);
}

chrome.extension.getBackgroundPage().appIdService.getAnonymousAppId(function (gaAnonAppId) {
    gaFunc = function (action, param1, param2, param3, param4) {
        if (action !== 'send' || !param1) {
            return;
        }

        var version = encodeURIComponent(chrome.runtime.getManifest().version);
        var message = 'v=1&tid=' + gaTrackingId + '&cid=' + gaAnonAppId + '&cd1=' + version;

        if (param1 === 'pageview' && param2) {
            message += gaTrackPageView(param2);
        }
        else if (param1 === 'event' && param2) {
            message += gaTrackEvent(param2);
        }
        else if (typeof param1 === 'object' && param1.hitType === 'event') {
            message += gaTrackEvent(param1);
        }

        var request = new XMLHttpRequest();
        request.open('POST', 'https://www.google-analytics.com/collect', true);
        request.send(message);
    };

    if (typeof isBackground !== 'undefined') {
        ga('send', 'pageview', '/background.html');
    }
});
