require('./bar.less');

$(function () {
    var content = document.getElementById('content'),
        closeButton = $('#close-button');

    // i18n
    $('body').addClass('lang-' + chrome.i18n.getUILanguage());

    $('#logo-link').attr('title', chrome.i18n.getMessage('appName'));
    closeButton.attr('title', chrome.i18n.getMessage('close'));

    if (window.innerWidth < 768) {
        $('#template-add .add-save').text(chrome.i18n.getMessage('yes'));
        $('#template-add .never-save').text(chrome.i18n.getMessage('never'));
    }
    else {
        $('#template-add .add-save').text(chrome.i18n.getMessage('notificationAddSave'));
        $('#template-add .never-save').text(chrome.i18n.getMessage('notificationNeverSave'));
    }

    $('#template-add .add-text').text(chrome.i18n.getMessage('notificationAddDesc'));

    if (getQueryVariable('add')) {
        setContent(document.getElementById('template-add'));

        var add = $('#template-add-clone'),
            addButton = $('#template-add-clone .add-save'),
            neverButton = $('#template-add-clone .never-save');

        $(addButton).click(function (e) {
            e.preventDefault();
            chrome.runtime.sendMessage({
                command: 'bgAddSave'
            });
        });

        $(neverButton).click(function (e) {
            e.preventDefault();
            chrome.runtime.sendMessage({
                command: 'bgNeverSave'
            });
        });
    }
    else if (getQueryVariable('info')) {
        setContent(document.getElementById('template-alert'));
        $('#template-alert-clone').text(getQueryVariable('info'));
    }

    closeButton.click(function (e) {
        e.preventDefault();
        chrome.runtime.sendMessage({
            command: 'bgCloseNotificationBar'
        });
    });

    chrome.runtime.sendMessage({
        command: 'bgAdjustNotificationBar',
        data: {
            height: document.body.scrollHeight
        }
    });

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
