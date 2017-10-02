document.addEventListener('DOMContentLoaded', function (event) {
    chrome.storage.local.get('enableAutoFillOnPageLoad', function (obj) {
        if (obj && obj.enableAutoFillOnPageLoad === true) {
            setTimeout(fill, 500);
            window.addEventListener('popstate', fill);
        }
    });

    function fill() {
        chrome.runtime.sendMessage({
            command: 'bgCollectPageDetails',
            sender: 'autofiller',
            noVisibleChecks: false
        });
    }
});
