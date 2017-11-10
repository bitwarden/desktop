require('./bar.less');

document.addEventListener('DOMContentLoaded', function () {
    // delay 50ms so that we get proper body dimensions
    setTimeout(load, 50);

    function load() {
        var content = document.getElementById('content'),
            closeButton = document.getElementById('close-button'),
            body = document.querySelector('body'),
            bodyRect = body.getBoundingClientRect();

        // i18n
        body.classList.add('lang-' + chrome.i18n.getUILanguage());

        document.getElementById('logo-link').title = chrome.i18n.getMessage('appName');
        closeButton.title = chrome.i18n.getMessage('close');

        if (bodyRect.width < 768) {
            document.querySelector('#template-add .add-save').textContent = chrome.i18n.getMessage('yes');
            document.querySelector('#template-add .never-save').textContent = chrome.i18n.getMessage('never');
        }
        else {
            document.querySelector('#template-add .add-save').textContent = chrome.i18n.getMessage('notificationAddSave');
            document.querySelector('#template-add .never-save').textContent = chrome.i18n.getMessage('notificationNeverSave');
        }

        document.querySelector('#template-add .add-text').textContent = chrome.i18n.getMessage('notificationAddDesc');

        if (getQueryVariable('add')) {
            setContent(document.getElementById('template-add'));

            var addButton = document.querySelector('#template-add-clone .add-save'),
                neverButton = document.querySelector('#template-add-clone .never-save');

            addButton.addEventListener('click', function (e) {
                e.preventDefault();
                chrome.runtime.sendMessage({
                    command: 'bgAddSave'
                });
            });

            neverButton.addEventListener('click', function (e) {
                e.preventDefault();
                chrome.runtime.sendMessage({
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
            chrome.runtime.sendMessage({
                command: 'bgCloseNotificationBar'
            });
        });

        chrome.runtime.sendMessage({
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
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        var newElement = element.cloneNode(true);
        newElement.id = newElement.id + '-clone';
        content.appendChild(newElement);
    }
});
