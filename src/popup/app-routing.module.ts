import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

import { LaunchGuardService } from './services/launch-guard.service';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { HomeComponent } from './accounts/home.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { SettingsComponent } from './settings/settings.component';
import { TabsComponent } from './tabs.component';
import { ExportComponent } from './tools/export.component';
import { PasswordGeneratorComponent } from './tools/password-generator.component';
import { PasswordGeneratorHistoryComponent } from './tools/password-generator-history.component';
import { ToolsComponent } from './tools/tools.component';
import { AddEditComponent } from './vault/add-edit.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CurrentTabComponent } from './vault/current-tab.component';
import { GroupingsComponent } from './vault/groupings.component';
import { ViewComponent } from './vault/view.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'vault',
        redirectTo: '/tabs/vault',
        pathMatch: 'full',
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'home' },
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'login' },
    },
    {
        path: 'lock',
        component: LockComponent,
        data: { state: 'lock' },
    },
    {
        path: '2fa',
        component: TwoFactorComponent,
        canActivate: [LaunchGuardService],
        data: { state: '2fa' },
    },
    {
        path: '2fa-options',
        component: TwoFactorOptionsComponent,
        canActivate: [LaunchGuardService],
        data: { state: '2fa-options' },
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'register' },
    },
    {
        path: 'hint',
        component: HintComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'hint' },
    },
    {
        path: 'environment',
        component: EnvironmentComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'environment' },
    },
    {
        path: 'ciphers',
        component: CiphersComponent,
        canActivate: [AuthGuardService],
        data: { state: 'ciphers' },
    },
    {
        path: 'view-cipher',
        component: ViewComponent,
        canActivate: [AuthGuardService],
        data: { state: 'view-cipher' },
    },
    {
        path: 'add-cipher',
        component: AddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'add-cipher' },
    },
    {
        path: 'edit-cipher',
        component: AddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'edit-cipher' },
    },
    {
        path: 'generator',
        component: PasswordGeneratorComponent,
        canActivate: [AuthGuardService],
        data: { state: 'generator' },
    },
    {
        path: 'generator-history',
        component: PasswordGeneratorHistoryComponent,
        canActivate: [AuthGuardService],
        data: { state: 'generator-history' },
    },
    {
        path: 'export',
        component: ExportComponent,
        canActivate: [AuthGuardService],
        data: { state: 'export' },
    },
    {
        path: 'tabs',
        component: TabsComponent,
        data: { state: 'tabs' },
        children: [
            {
                path: '',
                redirectTo: '/tabs/vault',
                pathMatch: 'full',
            },
            {
                path: 'current',
                component: CurrentTabComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_current' },
            },
            {
                path: 'vault',
                component: GroupingsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_vault' },
            },
            {
                path: 'tools',
                component: ToolsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_tools' },
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_settings' },
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
