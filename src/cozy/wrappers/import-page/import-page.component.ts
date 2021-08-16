import { Component, ViewEncapsulation } from '@angular/core';
import CozyClient from 'cozy-client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent, AngularWrapperProps } from '../angular-wrapper.component';
// @ts-ignore
import ImportPage from './import-page.jsx';

@Component({
    selector: 'app-import-page',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ImportPageComponent extends AngularWrapperComponent {
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
            React.createElement(ImportPage, await this.getProps()),
            this.getRootDomNode()
        );
    }
}
