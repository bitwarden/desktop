require('./bar.scss');

document.addEventListener('DOMContentLoaded', function () {
    var i18n = {};
    if (typeof safari !== 'undefined') {
        const responseCommand = 'notificationBarFrameDataResponse';
        sendPlatformMessage({
            command: 'bgGetDataForTab',
            responseCommand: responseCommand
        });
        safari.self.addEventListener('message', function (msgEvent) {
            const msg = msgEvent.message;
            if (msg.command === responseCommand && msg.data) {
                i18n = msg.data.i18n;
                load();
            }
        }, false);
    }
    else {
        i18n.appName = chrome.i18n.getMessage('appName');
        i18n.close = chrome.i18n.getMessage('close');
        i18n.yes = chrome.i18n.getMessage('yes');
        i18n.never = chrome.i18n.getMessage('never');
        i18n.notificationAddSave = chrome.i18n.getMessage('notificationAddSave');
        i18n.notificationNeverSave = chrome.i18n.getMessage('notificationNeverSave');
        i18n.notificationAddDesc = chrome.i18n.getMessage('notificationAddDesc');

        // delay 50ms so that we get proper body dimensions
        setTimeout(load, 50);
    }

    function load() {
        var closeButton = document.getElementById('close-button'),
            body = document.querySelector('body'),
            bodyRect = body.getBoundingClientRect();

        // i18n
        body.classList.add('lang-' + window.navigator.language.slice(0, 2));

        document.getElementById('logo-link').title = i18n.appName;
        closeButton.title = i18n.close;

        if (bodyRect.width < 768) {
            document.querySelector('#template-add .add-save').textContent = i18n.yes;
            document.querySelector('#template-add .never-save').textContent = i18n.never;
        }
        else {
            document.querySelector('#template-add .add-save').textContent = i18n.notificationAddSave;
            document.querySelector('#template-add .never-save').textContent = i18n.notificationNeverSave;
        }

        document.querySelector('#template-add .add-text').textContent = i18n.notificationAddDesc;

        if (getQueryVariable('add')) {
            setContent(document.getElementById('template-add'));

            var addButton = document.querySelector('#template-add-clone .add-save'),
                neverButton = document.querySelector('#template-add-clone .never-save');

            addButton.addEventListener('click', function (e) {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgAddSave'
                });
            });

            neverButton.addEventListener('click', function (e) {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgNeverSave'
                });
            });
        }
        else if (getQueryVariable('info')) {
            setContent(document.getElementById('template-alert'));
            document.getElementById('template-alert-clone').textContent = getQueryVariable('info');
        }

        closeButton.addEventListener('click', function (e) {
            e.preventDefault();
            sendPlatformMessage({
                command: 'bgCloseNotificationBar'
            });
        });

        sendPlatformMessage({
            command: 'bgAdjustNotificationBar',
            data: {
                height: body.scrollHeight
            }
        });
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return pair[1];
            }
        }

        return null;
    }

    function setContent(element) {
        const content = document.getElementById('content');
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        var newElement = element.cloneNode(true);
        newElement.id = newElement.id + '-clone';
        content.appendChild(newElement);
    }

    function sendPlatformMessage(msg) {
        if (typeof safari !== 'undefined') {
            safari.self.tab.dispatchMessage('bitwarden', msg);
        }
        else {
            chrome.runtime.sendMessage(msg);
        }
    }
});
