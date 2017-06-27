function U2f(successCallback, errorCallback, infoCallback) {
    this.success = successCallback;
    this.error = errorCallback;
    this.info = infoCallback;
    this.iframe = null;
    this.connectorLink = document.createElement('a');
};

U2f.prototype.init = function (data) {
    var self = this;

    self.connectorLink.href = 'https://vault.bitwarden.com/u2f-connector.html' +
        '?data=' + this.base64Encode(JSON.stringify(data)) +
        '&parent=' + encodeURIComponent(document.location.href) +
        '&v=1';

    self.iframe = document.getElementById('u2f_iframe');
    self.iframe.src = self.connectorLink.href;

    window.addEventListener('message', function (event) {
        if (!self.validMessage(event)) {
            self.error('Invalid message.');
            return;
        }

        var parts = event.data.split('|');
        if (parts[0] === 'success' && self.success) {
            self.success(parts[1]);
        }
        else if (parts[0] === 'error' && self.error) {
            self.error(parts[1]);
        }
        else if (parts[0] === 'info') {
            if (self.info) {
                self.info(parts[1]);
            }
        }
    }, false);
};

U2f.prototype.validMessage = function (event) {
    if (!event.origin || event.origin === '' || event.origin !== this.connectorLink.origin) {
        return false;
    }

    return event.data.indexOf('success|') === 0 || event.data.indexOf('error|') === 0 || event.data.indexOf('info|') === 0;
}

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
}
