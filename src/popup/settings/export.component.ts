import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { ExportComponent as BaseExportComponent } from 'jslib/angular/components/export.component';

@Component({
    selector: 'app-export',
    templateUrl: 'export.component.html',
})
export class ExportComponent extends BaseExportComponent {
    constructor(analytics: Angulartics2, toasterService: ToasterService,
        cipherService: CipherService, folderService: FolderService,
        cryptoService: CryptoService, userService: UserService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        private router: Router) {
        super(analytics, toasterService, cipherService, folderService, cryptoService, userService, i18nService,
            platformUtilsService, window);
    }

    protected saved() {
        super.saved();
        this.router.navigate(['/tabs/settings']);
    }
}
