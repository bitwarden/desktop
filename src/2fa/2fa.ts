require('../scripts/duo.js');

document.addEventListener('DOMContentLoaded', () => {
    const isSafari = (typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1;

    if (!isSafari) {
        return;
    }

    safari.self.addEventListener('message', (msgEvent: any) => {
        init2fa(msgEvent.message);
    }, false);

    function init2fa(msg: any) {
        if (msg.command !== '2faPageData' || !msg.data) {
            return;
        }

        if (msg.data.type === 'duo') {
            (window as any).Duo.init({
                host: msg.data.host,
                sig_request: msg.data.signature,
                submit_callback: (theForm: Document) => {
                    const sigElement = theForm.querySelector('input[name="sig_response"]') as HTMLInputElement;
                    if (sigElement) {
                        safari.self.tab.dispatchMessage('bitwarden', {
                            command: '2faPageResponse',
                            type: 'duo',
                            data: {
                                sigValue: sigElement.value,
                            },
                        });
                        window.close();
                    }
                },
            });
        } else {
            // TODO: others like u2f?
        }
    }
});
