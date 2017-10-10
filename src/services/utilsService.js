function UtilsService() {
    initUtilsService();

    this.browserCache = null;
    this.analyticsIdCache = null;
}

function initUtilsService() {
    UtilsService.prototype.getBrowser = function () {
        if (this.browserCache) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1) {
            this.browserCache = 'firefox';
        }
        else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = 'opera';
        }
        else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = 'edge';
        }
        else if (window.chrome) {
            this.browserCache = 'chrome';
        }

        return this.browserCache;
    };

    UtilsService.prototype.isFirefox = function () {
        return this.getBrowser() === 'firefox';
    };

    UtilsService.prototype.isChrome = function () {
        return this.getBrowser() === 'chrome';
    };

    UtilsService.prototype.isEdge = function () {
        return this.getBrowser() === 'edge';
    };

    UtilsService.prototype.isOpera = function () {
        return this.getBrowser() === 'opera';
    };

    UtilsService.prototype.analyticsId = function () {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        if (this.isChrome()) {
            this.analyticsIdCache = 'UA-81915606-6';
        }
        else if (this.isFirefox()) {
            this.analyticsIdCache = 'UA-81915606-7';
        }
        else if (this.isEdge()) {
            this.analyticsIdCache = 'UA-81915606-9';
        }
        else if (this.isOpera()) {
            this.analyticsIdCache = 'UA-81915606-8';
        }

        return this.analyticsIdCache;
    };

    UtilsService.prototype.getDeviceType = function () {
        if (this.isChrome()) {
            return 2;
        }
        else if (this.isFirefox()) {
            return 3;
        }
        else if (this.isEdge()) {
            return 5;
        }
        else if (this.isOpera()) {
            return 4;
        }

        return -1;
    };

    UtilsService.prototype.initListSectionItemListeners = function (doc, angular) {
        if (!doc) {
            throw 'doc parameter required';
        }

        doc.on('click', '.list-section-item', function (e) {
            if (e.isDefaultPrevented && e.isDefaultPrevented.name === 'returnTrue') {
                return;
            }

            var text = $(this).find('input, textarea').not('input[type="checkbox"], input[type="radio"], input[type="hidden"]');
            var checkbox = $(this).find('input[type="checkbox"]');
            var select = $(this).find('select');

            if (text.length > 0 && e.target === text[0]) {
                return;
            }
            if (checkbox.length > 0 && e.target === checkbox[0]) {
                return;
            }
            if (select.length > 0 && e.target === select[0]) {
                return;
            }

            e.preventDefault();

            if (text.length > 0) {
                text.focus();
            }
            else if (checkbox.length > 0) {
                checkbox.prop('checked', !checkbox.is(':checked'));
                if (angular) {
                    angular.element(checkbox[0]).triggerHandler('click');
                }
            }
            else if (select.length > 0) {
                select.focus();
            }
        });

        doc.on('focus', '.list-section-item input, .list-section-item select, .list-section-item textarea', function (e) {
            $(this).parent().addClass('active');
        });
        doc.on('blur', '.list-section-item input, .list-section-item select, .list-section-item textarea', function (e) {
            $(this).parent().removeClass('active');
        });
    };

    UtilsService.prototype.getDomain = function (uriString) {
        if (!uriString) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                var url = new URL(uriString);
                if (!url || !url.hostname) {
                    return null;
                }

                if (url.hostname === 'localhost' || validIpAddress(url.hostname)) {
                    return url.hostname;
                }

                if (tldjs) {
                    var domain = tldjs.getDomain(uriString);
                    if (domain) {
                        return domain;
                    }
                }

                return url.hostname;
            }
            catch (e) {
                return null;
            }
        }
        else if (tldjs) {
            var domain2 = tldjs.getDomain(uriString);
            if (domain2) {
                return domain2;
            }
        }

        return null;
    };

    UtilsService.prototype.getHostname = function (uriString) {
        if (!uriString) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                var url = new URL(uriString);
                if (!url || !url.hostname) {
                    return null;
                }

                return url.hostname;
            }
            catch (e) {
                return null;
            }
        }

        return null;
    };

    UtilsService.prototype.copyToClipboard = function (text, doc) {
        doc = doc || document;
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData('Text', text);
        }
        else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            var textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            doc.body.appendChild(textarea);
            textarea.select();

            try {
                // Security exception may be thrown by some browsers.
                return doc.execCommand('copy');
            }
            catch (ex) {
                console.warn('Copy to clipboard failed.', ex);
                return false;
            }
            finally {
                doc.body.removeChild(textarea);
            }
        }
    };

    UtilsService.prototype.inSidebar = function (theWindow) {
        return theWindow.location.search && theWindow.location.search.indexOf('uilocation=sidebar') > -1;
    };

    UtilsService.prototype.inTab = function (theWindow) {
        return theWindow.location.search && theWindow.location.search.indexOf('uilocation=tab') > -1;
    };

    UtilsService.prototype.inPopout = function (theWindow) {
        return theWindow.location.search && theWindow.location.search.indexOf('uilocation=popout') > -1;
    };

    UtilsService.prototype.inPopup = function (theWindow) {
        return theWindow.location.search && theWindow.location.search.indexOf('uilocation=popup') > -1;
    };

    function validIpAddress(ipString) {
        var ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ipString);
    }
}
