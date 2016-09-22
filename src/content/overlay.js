!(function () {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'openOverlayPopup') {
            openPopup(msg.data);
            sendResponse();
            return true;
        }
        else if (msg.command === 'closeOverlayPopup') {
            closePopup();
            sendResponse();
            return true;
        }
    });

    function openPopup(data) {
        var left = 0,
            top = 0;

        if (data && data.position) {
            left = data.position.left || 0;
            top = data.position.top || 0;
        }

        var iframe = document.createElement('iframe');
        iframe.src = chrome.extension.getURL('overlay/popup.html');
        iframe.style.cssText = 'height: 200px; width: 250px; border: 2px solid #000;; position: absolute; visibility: visible; left: ' + left + '; top: ' + top + '; z-index: 999999999;';
        iframe.id = 'bit-overlay-popup';
        document.body.insertBefore(iframe, document.body.lastChild);
    }

    function closePopup() {
        document.getElementById('bit-overlay-popup').remove();
    }
})();
