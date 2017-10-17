(function () {
    var bgPage = chrome.extension.getBackgroundPage();
    if (!bgPage) {
        return;
    }

    var gaTrackingId = bgPage.bg_utilsService.analyticsId();
    var gaFunc = null;
    var isFirefox = bgPage.bg_utilsService.isFirefox();

    window.GoogleAnalyticsObject = 'ga';
    window[window.GoogleAnalyticsObject] = function (action, param1, param2, param3, param4) {
        if (!gaFunc) {
            return;
        }

        chrome.storage.local.get('disableGa', function (obj) {
            // Default for Firefox is disabled.
            if ((isFirefox && obj.disableGa === undefined) || obj.disableGa) {
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
            (options.page ? '&dp=' + cleanPagePath(options.page) : '');
    }

    function gaTrackPageView(pagePath) {
        return '&t=pageview&dp=' + cleanPagePath(pagePath);
    }

    function cleanPagePath(pagePath) {
        var paramIndex = pagePath.indexOf('?');
        if (paramIndex > -1) {
            pagePath = pagePath.substring(0, paramIndex);
        }
        return encodeURIComponent(pagePath);
    }

    bgPage.bg_appIdService.getAnonymousAppId().then(function (gaAnonAppId) {
        gaFunc = function (action, param1, param2, param3, param4) {
            if (action !== 'send' || !param1) {
                return;
            }

            var version = encodeURIComponent(chrome.runtime.getManifest().version);
            var message = 'v=1&tid=' + gaTrackingId + '&cid=' + gaAnonAppId + '&cd1=' + version;

            if (param1 === 'pageview' && param2) {
                message += gaTrackPageView(param2);
            }
            else if (typeof param1 === 'object' && param1.hitType === 'pageview') {
                message += gaTrackPageView(param1.page);
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

        if (typeof bg_isBackground !== 'undefined') {
            ga('send', 'pageview', '/background.html');
        }
    });
})();
