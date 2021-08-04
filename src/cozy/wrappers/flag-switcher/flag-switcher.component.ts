import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent } from '../angular-wrapper.component';

// @ts-ignore
import flag from 'cozy-flags';
// @ts-ignore
import FlagSwitcher from 'cozy-flags/dist/FlagSwitcher';

@Component({
    selector: 'app-flag-switcher',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class FlagSwitcherComponent extends AngularWrapperComponent {

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        if (process.env.NODE_ENV === 'development') {
            flag('switcher', true);
        }

        ReactDOM.render(
            React.createElement(FlagSwitcher),
            this.getRootDomNode()
        );
    }
}
