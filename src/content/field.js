!(function () {
    var icons = [],
        setIconsIntervalId = null,
        setIconsIntervalRunCount = 0,
        positionIconsIntervalId = null,
        positionIconsIntervalRunCount = 0;

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'setFieldOverlayIcons') {
            setFieldOverlayIcons();
            sendResponse();
            return true;
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        setFieldOverlayIcons();

        var bodies = document.querySelectorAll('body');
        if (bodies.length > 0) {
            var obs = new window.MutationObserver(function (mutations, observer) {
                var refreshIcons = false;
                for (var i = 0; i < mutations.length; i++) {
                    var mutation = mutations[i];
                    for (var j = 0; j < mutation.addedNodes.length; j++) {
                        if (mutation.addedNodes[j].className !== 'bitwarden-field-icon') {
                            refreshIcons = true;
                            break;
                        }
                    }

                    if (refreshIcons) {
                        break;
                    }

                    for (var j = 0; j < mutation.removedNodes.length; j++) {
                        if (mutation.removedNodes[j].className !== 'bitwarden-field-icon') {
                            refreshIcons = true;
                            break;
                        }
                    }

                    if (refreshIcons) {
                        break;
                    }
                }

                if (refreshIcons) {
                    if (setIconsIntervalId) {
                        clearInterval(setIconsIntervalId);
                        setIconsIntervalId = null;
                        setIconsIntervalRunCount = 0;
                    }

                    setIconsIntervalId = setInterval(setFieldOverlayIcons, 500);
                }

                if (positionIconsIntervalId) {
                    clearInterval(positionIconsIntervalId);
                    positionIconsIntervalId = null;
                    positionIconsIntervalRunCount = 0;
                }

                positionIconsIntervalId = setInterval(adjustIconPositions, 500);
            });

            obs.observe(bodies[0], { childList: true, subtree: true, attributes: true, characterData: true, attributeFilter: ['style'] });
        }
    }, false);

    function setFieldOverlayIcons() {
        if (setIconsIntervalId && setIconsIntervalRunCount == 1) {
            clearInterval(setIconsIntervalId);
            setIconsIntervalId = null;
            setIconsIntervalRunCount = 0;
        }
        setIconsIntervalRunCount++;

        for (var i = 0; i < icons.length; i++) {
            icons[i].icon.parentElement.removeChild(icons[i].icon);
        }
        icons = [];

        var pageDetails = null; TODO: collect //JSON.parse(collect(document));
        if (pageDetails) {
            var iconFields = [];

            for (i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.type === 'password') {
                    iconFields.push(f);

                    var fieldJustBeforePassword = null;
                    for (var j = 0; j < pageDetails.fields.length; j++) {
                        var f2 = pageDetails.fields[j];
                        if ((f2.type === 'text' || f2.type === 'email') && f2.elementNumber < f.elementNumber) {
                            fieldJustBeforePassword = f2;
                        }
                    }

                    if (!iconFields.includes(fieldJustBeforePassword)) {
                        iconFields.push(fieldJustBeforePassword);
                    }
                }
            }

            for (i = 0; i < iconFields.length; i++) {
                var element = getElement(iconFields[i].opid);
                if (!element.offsetHeight) {
                    continue;
                }

                var div = document.createElement('div');
                div.className = 'bitwarden-field-icon';
                div.style.cssText = 'position: absolute; z-index: 99999; width: 25px; height: ' + element.offsetHeight + 'px;' +
                    'background-position: center center; background-repeat: no-repeat; cursor: pointer;';
                div.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/" +
                    "9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFfSURBVHja1JO/aoNQFMY/" +
                    "TQipkLEBFyHZM8YxU7ZAoVBcXBw69RFK3qJQkLxBxoJByBIQnCQkPoRDwERcmv/pPRcjWmtp6dQPPu/hes7v4PVcYTgc3gJ4Yb5j" +
                    "vsHP9M5sMT9V2cNkvsfvRI0emCsEGNBOv99Ht9uFIAi4XC5pZr1eT+PT6YTD4QDP8zCdTmlrQIAaRY1GA5Ik5dqcz2eeTCtZlm" +
                    "W0Wi2em6hWvUbZrlnAZDLhnUmqqnJAViL+qH8GEEWxHLBer7Hdbr8FKIrCD5ZyC4DFYgHf90uL2+02Op0OlssldwEQxzFs20YYhrl" +
                    "C+oVUaBgGoiiCZVnYbDZfnwFN2Wg0QhAE6Z6u69A0DavVCqZpYrfb5RpUer3eM61ZyHw+5wdG39xsNuE4DsbjcaGYaU+TaCc3MTeBs9" +
                    "mMFxDIdd10Gj/JJsAj82sCqV3fHI9H3rlEe+Y3us4fAgwAGf2Q/1DENX0AAAAASUVORK5CYII=')";

                document.body.insertBefore(div, document.body.lastChild);

                var icon = { element: element, icon: div };
                adjustIconPosition(icon);
                icons.push(icon);

                div.addEventListener('click', function (event) {
                    event.stopPropagation();
                    for (var i = 0; i < icons.length; i++) {
                        if (icons[i].icon == this) {
                            var rect = icons[i].element.getBoundingClientRect();
                            chrome.runtime.sendMessage({
                                command: 'bgOpenOverlayPopup',
                                data: {
                                    position: {
                                        left: rect.left,
                                        top: rect.top + rect.height + 5
                                    }
                                }
                            });
                        }
                    }
                }, false);
            }
        }
    }

    window.addEventListener('resize', function (event) {
        adjustIconPositions();
    }, false);

    function adjustIconPositions() {
        if (positionIconsIntervalId) {
            clearInterval(positionIconsIntervalId);
            positionIconsIntervalId = null;
            positionIconsIntervalRunCount = 0;
        }
        positionIconsIntervalRunCount++;

        for (var i = 0; i < icons.length; i++) {
            adjustIconPosition(icons[i]);
        }
    }

    function adjustIconPosition(i) {
        var rect = i.element.getBoundingClientRect();
        i.icon.style.top = rect.top + 'px';
        i.icon.style.left = (rect.left + rect.width - 25) + 'px';
    }

    document.addEventListener('click', function (event) {
        chrome.runtime.sendMessage({ command: 'bgCloseOverlayPopup' });
    }, false);

    function getElement(opid) {
        if (!opid) {
            return null;
        }

        var element;
        try {
            var inputFields = Array.prototype.slice.call(document.querySelectorAll('input'));
            var opidInputFields = inputFields.filter(function (b) {
                return b.opid === opid;
            });

            if (opidInputFields.length > 0) {
                element = opidInputFields[0];

                if (opidInputFields.length > 1) {
                    console.warn('More than one element found with opid ' + opid);
                }
            }
            else {
                var index = parseInt(opid.split('__')[1], 10);
                isNaN(index) || (element = inputFields[index])
            }
        }
        catch (e) {
            console.error('An unexpected error occurred: ' + e);
        }
        finally {
            return element;
        }
    }
})();
