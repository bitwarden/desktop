$(function () {
    var content = document.getElementById('content'),
        closeButton = $('#close-button');

    // i18n
    $('#logo-link').attr('title', chrome.i18n.getMessage('appName'));
    closeButton.attr('title', chrome.i18n.getMessage('close'));
    $('#template-add .add-save').text(chrome.i18n.getMessage('notificationAddSave'));
    $('#template-add .add-text').text(chrome.i18n.getMessage('notificationAddDesc'));

    if (getQueryVariable('add')) {
        setContent(document.getElementById('template-add'));

        var add = $('#template-add-clone'),
            addButton = $('#template-add-clone .add-save');

        $(addButton).click(function (e) {
            e.preventDefault();
            chrome.runtime.sendMessage({
                command: 'bgAddSave'
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
