document.addEventListener('DOMContentLoaded', function (event) {
    var pageHref = null;

    chrome.storage.local.get('enableAutoFillOnPageLoad', function (obj) {
        if (obj && obj.enableAutoFillOnPageLoad === true) {
            setInterval(doFillIfNeeded, 500);
        }
    });

    function doFillIfNeeded() {
        if (pageHref !== window.location.href) {
            pageHref = window.location.href;
            fill();
        }
    }

    function fill() {
        chrome.runtime.sendMessage({
            command: 'bgCollectPageDetails',
            sender: 'autofiller'
        });
    }
});
