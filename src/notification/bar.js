$(function () {
    var content = document.getElementById('content'),
        template_add = document.getElementById('template-add'),
        template_alert = document.getElementById('template-alert');

    if (getQueryVariable('add')) {
        setContent(template_add);

        var add = $('#template-add-clone'),
            addButton = $('#template-add-clone.add-save'),
            neverButton = $('#template-add-clone.add-never');
    }
    else if (getQueryVariable('info')) {
        setContent(template_alert);
        $('#template-alert-clone').text(getQueryVariable('info'));
    }

    $('#close-button').click(function (e) {
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
            if (pair[0] == variable) {
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
