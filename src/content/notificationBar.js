!(function () {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'openNotificationBar') {
            closeBar();
            openBar();
            sendResponse();
            return true;
        }
        else if (msg.command === 'closeNotificationBar') {
            closeBar();
            sendResponse();
            return true;
        }
    });

    function openBar() {
        var iframe = document.createElement('iframe');
        iframe.src = chrome.extension.getURL('notification/bar.html');
        iframe.style.cssText = 'height: 41px; width: 100%; border: 0;';

        var frameDiv = document.createElement('div');
        frameDiv.id = 'bit-notification-bar';
        frameDiv.style.cssText = 'height: 41px; width: 100%; top: 0; left: 0; padding: 0; position: fixed; z-index: 1000000099; visibility: visible;';
        frameDiv.appendChild(iframe);
        document.body.appendChild(frameDiv);

        var spacer = document.createElement('div');
        spacer.id = 'bit-notification-bar-spacer';
        spacer.style.cssText = 'height: 41px;';
        document.body.insertBefore(spacer, document.body.firstChild);
    }

    function closeBar() {
        var el = document.getElementById('bit-notification-bar');
        if (el) {
            el.parentElement.removeChild(el);
        }

        el = document.getElementById('bit-notification-bar-spacer');
        if (el) {
            el.parentElement.removeChild(el);
        }
    }
})();
