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

    protected async getProps(): Promise<AngularWrapperProps> {
        const reactWrapperProps = await this.getReactWrapperProps();

        return {
            reactWrapperProps: reactWrapperProps,
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(ButtonExtension, await this.getProps()),
            this.getRootDomNode()
        );
    }
}
