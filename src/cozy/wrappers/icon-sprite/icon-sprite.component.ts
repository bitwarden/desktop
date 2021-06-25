import {
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
// @ts-ignore
import { Sprite as IconSprite } from 'cozy-ui/transpiled/react/Icon';
import * as invariant from 'invariant';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as uuid from 'uuid';
@Component({
    selector: 'app-icon-sprite',
    templateUrl: './icon-sprite.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class IconSpriteComponent
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
                React.createElement(IconSprite),
                this.getRootDomNode()
            );
        }
    }

    private isMounted(): boolean {
        return !!this.rootDomID;
    }
}
