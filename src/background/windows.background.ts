import MainBackground from './main.background';

export default class WindowsBackground {
    private windows: any;

    constructor(private main: MainBackground) {
        this.windows = chrome.windows;
    }

    async init() {
        if (!this.windows) {
            return;
        }

        this.windows.onFocusChanged.addListener(async (windowId: any) => {
            if (windowId === null || windowId < 0) {
                return;
            }

            await this.main.refreshBadgeAndMenu();
        });
    }
}
