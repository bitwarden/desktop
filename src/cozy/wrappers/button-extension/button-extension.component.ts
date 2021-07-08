import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    AngularWrapperComponent,
    AngularWrapperProps,
} from '../angular-wrapper.component';
// @ts-ignore
import ButtonExtension from './button-extension.jsx';

@Component({
    selector: 'app-button-extension',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ButtonExtensionComponent extends AngularWrapperComponent {
    /******************/
    /* Props Bindings */
    /******************/

    protected getProps(): AngularWrapperProps {
        const data = {
            extension_installed: false, // not used in this component
        };

        const client = this.clientService.GetClient();

        return {
            client: client,
            bitwardenData: data,
            vaultData: this.getVaultData(),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(ButtonExtension, this.getProps()),
            this.getRootDomNode()
        );
    }
}
