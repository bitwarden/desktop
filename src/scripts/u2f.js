function U2f(webVaultUrl, successCallback, errorCallback, infoCallback) {
    this.success = successCallback;
    this.error = errorCallback;
    this.info = infoCallback;
    this.iframe = null;
    this.connectorLink = document.createElement('a');
    this.webVaultUrl = webVaultUrl && webVaultUrl !== '' ? webVaultUrl : 'https://vault.bitwarden.com';
}

(function () {
    var thisU2f = null;

    U2f.prototype.init = function (data) {
        /* jshint ignore:start */
        var self = thisU2f = this;
        /* jshint ignore:end */

        self.connectorLink.href = self.webVaultUrl + '/u2f-connector.html' +
            '?data=' + this.base64Encode(JSON.stringify(data)) +
            '&parent=' + encodeURIComponent(document.location.href) +
            '&v=1';

        self.iframe = document.getElementById('u2f_iframe');
        self.iframe.src = self.connectorLink.href;

        window.addEventListener('message', parseMessage, false);
    };

    U2f.prototype.validMessage = function (event) {
        if (!event.origin || event.origin === '' || event.origin !== this.connectorLink.origin) {
            return false;
        }

        return event.data.indexOf('success|') === 0 || event.data.indexOf('error|') === 0 || event.data.indexOf('info|') === 0;
    };

    U2f.prototype.stop = function () {
        this.sendMessage('stop');
    };

    U2f.prototype.start = function () {
        this.sendMessage('start');
    };

    U2f.prototype.sendMessage = function (message) {
        var self = this;
        if (!self.iframe || !self.iframe.src || !self.iframe.contentWindow) {
            return;
        }

        self.iframe.contentWindow.postMessage(message, self.iframe.src);
    };

    U2f.prototype.base64Encode = function (str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    };

    U2f.prototype.cleanup = function () {
        window.removeEventListener('message', parseMessage, false);
    };

    function parseMessage(event) {
        if (!thisU2f) {
            return;
        }

        if (!thisU2f.validMessage(event)) {
            thisU2f.error('Invalid message.');
            return;
        }

        var parts = event.data.split('|');
        if (parts[0] === 'success' && thisU2f.success) {
            thisU2f.success(parts[1]);
        }
        else if (parts[0] === 'error' && thisU2f.error) {
            thisU2f.error(parts[1]);
        }
        else if (parts[0] === 'info') {
            if (thisU2f.info) {
                thisU2f.info(parts[1]);
            }
        }
    }
})();
