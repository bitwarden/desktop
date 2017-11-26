import * as angular from 'angular';
import { AboutComponent } from './about.component';
import { CreditsComponent } from './credits.component';
import { EnvironmentComponent } from './environment.component';
import { FeaturesComponent } from './features.component';
import { AddFolderComponent } from './folders/add-folder.component';
import { EditFolderComponent } from './folders/edit-folder.component';
import { FoldersComponent } from './folders/folders.component';
import { HelpComponent } from './help.component';
import { PremiumComponent } from './premium.component';
import { SettingsComponent } from './settings.component';
import { SyncComponent } from './sync.component';

export default angular
    .module('bit.settings', ['oitozero.ngSweetAlert', 'toastr'])

    .component('settings', SettingsComponent)
    .component('environment', EnvironmentComponent)
    .component('features', FeaturesComponent)
    .component('about', AboutComponent)
    .component('credits', CreditsComponent)
    .component('help', HelpComponent)
    .component('folders', FoldersComponent)
    .component('addFolder', AddFolderComponent)
    .component('editFolder', EditFolderComponent)
    .component('premium', PremiumComponent)
    .component('sync', SyncComponent)

    .name;
