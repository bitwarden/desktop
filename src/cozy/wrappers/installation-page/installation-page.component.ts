import { Component, ViewEncapsulation } from '@angular/core';
import CozyClient from 'cozy-client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MessagingService } from '../../../../jslib/src/abstractions/messaging.service';
import { CozyClientService } from '../../services/cozy-client.service';
import { VaultInstallationService } from '../../services/installation-guard.service';
import { AngularWrapperComponent } from '../angular-wrapper.component';
// @ts-ignore
import InstallationPage from './installation-page.jsx';

interface InstallationPageProps {
    client: CozyClient;
    bitwardenData: {
        extension_installed: boolean;
    };
    onSkipExtension: any;
}

@Component({
    selector: 'app-installation-page',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class InstallationPageComponent extends AngularWrapperComponent {
    constructor(
        protected clientService: CozyClientService,
        private vaultInstallationService: VaultInstallationService,
        private messagingService: MessagingService
    ) {
        super(clientService);
    }
    /******************/
    /* Props Bindings */
    /******************/

    protected onSkipExtension() {
        this.vaultInstallationService.setIsInstalled();
        this.messagingService.send('installed');
    }

    protected getProps(): InstallationPageProps {
        const data = {
            extension_installed: false, // to be replaced with client fetch
        };

        const client = this.clientService.GetClient();

        return {
            client: client,
            bitwardenData: data,
            onSkipExtension: this.onSkipExtension.bind(this),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected renderReact() {
        ReactDOM.render(
            React.createElement(InstallationPage, this.getProps()),
            this.getRootDomNode()
        );
    }
}
