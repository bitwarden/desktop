import * as Mousetrap from 'mousetrap';

document.addEventListener('DOMContentLoaded', (event) => {
    const isSafari = (typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1;
    const isEdge = !isSafari && navigator.userAgent.indexOf(' Edge/') !== -1;
    const isVivaldi = !isSafari && navigator.userAgent.indexOf(' Vivaldi/') !== -1;

    if (!isSafari && !isEdge && !isVivaldi) {
        return;
    }

    Mousetrap.prototype.stopCallback = () => {
        return false;
    };

    const autofillCommand = isSafari || isEdge ? 'mod+\\' : 'mod+shift+l';
    Mousetrap.bind(autofillCommand, () => {
        sendMessage('autofill_login');
    });

    if (isSafari) {
        Mousetrap.bind('mod+shift+y', () => {
            sendMessage('open_popup');
        });
    } else if (!this.isEdge) {
        Mousetrap.bind('mod+shift+9', () => {
            sendMessage('generate_password');
        });
    }

    function sendMessage(shortcut: string) {
        const msg = {
            command: 'keyboardShortcutTriggered',
            shortcut: shortcut,
        };

        if (isSafari) {
            safari.self.tab.dispatchMessage('bitwarden', msg);
        } else {
            chrome.runtime.sendMessage(msg);
        }
    }
});
