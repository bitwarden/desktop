import {
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import * as invariant from 'invariant';
import * as uuid from 'uuid';
import { CozyClientService } from '../services/cozy-client.service';

@Component({
    templateUrl: './angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AngularWrapperComponent
    implements OnChanges, OnDestroy, OnInit, AfterViewInit
{
    rootDomID: string = '';

    constructor(protected clientService: CozyClientService) {}

    /*************/
    /* Lifecycle */
    /*************/

    ngOnInit() {
        this.rootDomID = uuid.v1();
    }

    ngOnChanges() {
        this.renderReactIfMounted();
    }

    ngAfterViewInit() {
        this.renderReactIfMounted();
    }

    ngOnDestroy() {
        // Uncomment if Angular 4 issue that ngOnDestroy is called AFTER DOM node removal is resolved
        // ReactDOM.unmountComponentAtNode(this.getRootDomNode())
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
        throw new Error('should be overridden');
    }

    protected renderReactIfMounted() {
        if (this.isMounted()) {
            this.renderReact();
        }
    }

    private isMounted(): boolean {
        return !!this.rootDomID;
    }
}
