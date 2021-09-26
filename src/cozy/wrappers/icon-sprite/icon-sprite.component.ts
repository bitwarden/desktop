import { Component, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import Sprite from 'cozy-ui/transpiled/react/Icon/Sprite';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent } from '../angular-wrapper.component';

@Component({
    selector: 'app-icon-sprite',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class IconSpriteComponent extends AngularWrapperComponent {
    /**********/
    /* Render */
    /**********/

    protected renderReact() {
        ReactDOM.render(React.createElement(Sprite), this.getRootDomNode());
    }
}
