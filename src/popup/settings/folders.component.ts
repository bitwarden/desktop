import { Location } from '@angular/common';
import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { FolderView } from 'jslib/models/view/folderView';

import { FolderService } from 'jslib/abstractions/folder.service';

@Component({
    selector: 'app-folders',
    templateUrl: 'folders.component.html',
})
export class FoldersComponent implements OnInit {
    folders: FolderView[];

    constructor(private folderService: FolderService, private location: Location,
        private router: Router) {
    }

    async ngOnInit() {
        this.folders = await this.folderService.getAllDecrypted();
    }

    folderSelected(folder: FolderView) {
        this.router.navigate(['/edit-folder'], { queryParams: { folderId: folder.id } });
    }

    addFolder() {
        this.router.navigate(['/add-folder']);
    }

    close() {
        this.location.back();
    }
}
