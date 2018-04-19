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

    constructor(private folderService: FolderService, private router: Router) { }

    async ngOnInit() {
        this.folders = await this.folderService.getAllDecrypted();
        // Remove "No Folder"
        if (this.folders.length > 0) {
            this.folders = this.folders.slice(0, this.folders.length - 1);
        }
    }

    folderSelected(folder: FolderView) {
        this.router.navigate(['/edit-folder'], { queryParams: { folderId: folder.id } });
    }

    addFolder() {
        this.router.navigate(['/add-folder']);
    }
}
