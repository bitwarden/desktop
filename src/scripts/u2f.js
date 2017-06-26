function U2f(successCallback, errorCallback, infoCallback) {
    this.success = successCallback;
    this.error = errorCallback;
    this.info = infoCallback;
    this.iframe = null;
};

U2f.prototype.init = function (data) {
    var self = this;

    iframe = document.getElementById('u2f_iframe');
    iframe.src = 'https://vault.bitwarden.com/u2f-connector.html' +
        '?data=' + this.base64Encode(JSON.stringify(data)) +
        '&parent=' + encodeURIComponent(document.location.href) +
        '&v=1';

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
    if (event.origin !== 'https://vault.bitwarden.com') {
        return false;
    }

    return event.data.indexOf('success|') === 0 || event.data.indexOf('error|') === 0 || event.data.indexOf('info|') === 0;
}

U2f.prototype.base64Encode = function (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
