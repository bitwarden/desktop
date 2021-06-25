import { Component, ViewEncapsulation } from '@angular/core';
import CozyClient from 'cozy-client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent } from '../angular-wrapper.component.js';
// @ts-ignore
import ImportPage from './import-page.jsx';


interface ImportPageProps {
    client: CozyClient;
    bitwardenData: {
        extension_installed: boolean;
    };
}

@Component({
    selector: 'app-import-page',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ImportPageComponent extends AngularWrapperComponent {
    /******************/
    /* Props Bindings */
    /******************/

    protected getProps(): ImportPageProps {
        const data = {
            extension_installed: true, // to be replaced with client fetch
        };

        const client = CozyClient.fromDOM();

        return {
            client: client,
            bitwardenData: data,
        };
    }

    /**********/
    /* Render */
    /**********/

    protected renderReact() {
        ReactDOM.render(
            React.createElement(ImportPage, this.getProps()),
            this.getRootDomNode()
        );
    }
}
