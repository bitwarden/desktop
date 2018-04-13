import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    FolderAddEditComponent as BaseFolderAddEditComponent,
} from 'jslib/angular/components/folder-add-edit.component';

@Component({
    selector: 'app-folder-add-edit',
    templateUrl: 'folder-add-edit.component.html',
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
    constructor(folderService: FolderService, i18nService: I18nService,
        analytics: Angulartics2, toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService, private location: Location,
        private router: Router, private route: ActivatedRoute) {
        super(folderService, i18nService, analytics, toasterService, platformUtilsService);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.folderId) {
                this.folderId = params.folderId;
            }
            await super.ngOnInit();
        });
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            this.location.back();
            return true;
        }

        return false;
    }

    cancel() {
        this.location.back();
    }

    async delete(): Promise<boolean> {
        const confirmed = await super.delete();
        if (confirmed) {
            this.location.back();
        }
        return confirmed;
    }
}
