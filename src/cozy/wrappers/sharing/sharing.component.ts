import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent, AngularWrapperProps } from '../angular-wrapper.component';
// @ts-ignore
import Sharing from './sharing.jsx';

type Doctype = 'com.bitwarden.organizations';

interface File {
    id: string;
    name: string;
    _type: Doctype;
    _id: string;
}

interface SharingProps extends AngularWrapperProps {
    file: File;
}

@Component({
    selector: 'app-sharing',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class SharingComponent extends AngularWrapperComponent {
    @Input() collectionId: string = null;

    /******************/
    /* Props Bindings */
    /******************/

    protected async getProps(): Promise<SharingProps> {
        const collections = await this.collectionService.getAllDecrypted();

        const currentCollection = collections.find(collection => collection.id === this.collectionId);

        const reactWrapperProps = await this.getReactWrapperProps();

        return {
            reactWrapperProps: reactWrapperProps,
            file: {
                id: currentCollection.organizationId,
                name: currentCollection.name,
                _type: 'com.bitwarden.organizations',
                _id: currentCollection.organizationId,
            },
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(Sharing, await this.getProps()),
            this.getRootDomNode()
        );
    }
}
