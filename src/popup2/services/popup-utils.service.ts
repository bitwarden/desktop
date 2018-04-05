import { Injectable } from '@angular/core';

@Injectable()
export class PopupUtilsService {
    inSidebar(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=sidebar') > -1;
    }

    inTab(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=tab') > -1;
    }

    inPopout(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=popout') > -1;
    }

    inPopup(win: Window): boolean {
        return win.location.search === '' || win.location.search.indexOf('uilocation=') === -1 ||
            win.location.search.indexOf('uilocation=popup') > -1;
    }
}
