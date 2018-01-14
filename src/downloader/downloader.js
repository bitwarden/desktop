document.addEventListener('DOMContentLoaded', function () {
    if (typeof safari === 'undefined') {
        return;
    }

    safari.self.addEventListener('message', function (msgEvent) {
        const msg = msgEvent.message;
        if (msg.command === 'downloaderPageData' && msg.data) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(msg.data.blob);
            a.download = msg.data.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }, false);
});
