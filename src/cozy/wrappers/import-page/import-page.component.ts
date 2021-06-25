import {
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import CozyClient from 'cozy-client';
import * as invariant from 'invariant';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as uuid from 'uuid';
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
    templateUrl: './import-page.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ImportPageComponent
    implements OnChanges, OnDestroy, OnInit, AfterViewInit
{
    rootDomID: string = '';

    /*************/
    /* Lifecycle */
    /*************/

    ngOnInit() {
        this.rootDomID = uuid.v1();
    }

    ngOnChanges() {
        this.renderReact();
    }

    ngAfterViewInit() {
        this.renderReact();
    }

    ngOnDestroy() {
        // Uncomment if Angular 4 issue that ngOnDestroy is called AFTER DOM node removal is resolved
        // ReactDOM.unmountComponentAtNode(this.getRootDomNode())
    }

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

    protected getRootDomNode() {
        const node = document.getElementById(this.rootDomID);
        invariant(node, `Node '${this.rootDomID} not found!`);
        return node;
    }

    protected renderReact() {
        if (this.isMounted()) {
            ReactDOM.render(
                React.createElement(ImportPage, this.getProps()),
                this.getRootDomNode()
            );
        }
    }

    private isMounted(): boolean {
        return !!this.rootDomID;
    }
}
