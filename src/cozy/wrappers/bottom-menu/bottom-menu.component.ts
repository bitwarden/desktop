import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    AngularWrapperComponent,
    AngularWrapperProps,
} from '../angular-wrapper.component';
// @ts-ignore
import BottomMenu from './bottom-menu.jsx';

interface BottomMenuProps extends AngularWrapperProps {
    isTrashContext: boolean;
    deleteCurrentCiphers: () => {};
    restoreCurrentCiphers: () => {};
}

@Component({
    selector: 'app-bottom-menu',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class BottomMenuComponent extends AngularWrapperComponent {
    @Input() isTrashContext: boolean = false;
    @Output() deleteCurrentCiphers = new EventEmitter<void>();
    @Output() restoreCurrentCiphers = new EventEmitter<void>();

    /******************/
    /* Props Bindings */
    /******************/

    protected async getProps(): Promise<BottomMenuProps> {
        const reactWrapperProps = await this.getReactWrapperProps();

        return {
            reactWrapperProps: reactWrapperProps,
            isTrashContext: this.isTrashContext,
            deleteCurrentCiphers: this.executeDeleteCurrentCiphers.bind(this),
            restoreCurrentCiphers: this.executeRestoreCurrentCiphers.bind(this),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(BottomMenu, await this.getProps()),
            this.getRootDomNode()
        );
    }

    /*****************/
    /* Trash Methods */
    /*****************/

    protected async executeDeleteCurrentCiphers() {
        return await this.deleteCurrentCiphers.emit();
    }

    protected async executeRestoreCurrentCiphers() {
        return await this.restoreCurrentCiphers.emit();
    }
}
