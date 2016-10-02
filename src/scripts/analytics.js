var gaTrackingId = chrome.extension.getBackgroundPage().utilsService.analyticsId();

if (gaTrackingId) {
    ga('create', gaTrackingId, 'auto');
}

// version dimension
ga('set', 'dimension1', chrome.runtime.getManifest().version);

// Removes failing protocol check. ref: http://stackoverflow.com/a/22152353/1958200
ga('set', 'checkProtocolTask', function () { });

if (typeof isBackground !== 'undefined') {
    ga('send', 'pageview', '/background.html');
}
