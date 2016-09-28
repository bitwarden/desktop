var gaUtils = chrome.extension.getBackgroundPage().utilsService,
    gaTrackingId = null;

if (gaUtils.isChrome()) {
    gaTrackingId = 'UA-81915606-6';
}
else if (gaUtils.isFirefox()) {
    gaTrackingId = 'UA-81915606-7';
}
else if (gaUtils.isEdge()) {
    gaTrackingId = 'UA-81915606-9';
}
else if (gaUtils.isOpera()) {
    gaTrackingId = 'UA-81915606-8';
}

if (gaTrackingId) {
    ga('create', gaTrackingId, 'auto');
}

// Removes failing protocol check. ref: http://stackoverflow.com/a/22152353/1958200
ga('set', 'checkProtocolTask', function () { });

if (typeof isBackground !== 'undefined') {
    ga('send', 'pageview', '/background.html');
}
