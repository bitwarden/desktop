import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    VaultInstalledGuardService,
    VaultUninstalledGuardService,
} from '../cozy/services/installation-guard.service';
import { InstallationPageComponent } from '../cozy/wrappers/installation-page/installation-page.component';

import { LockGuardService } from 'jslib/angular/services/lock-guard.service';
import { UnauthGuardService } from 'jslib/angular/services/unauth-guard.service';
import { AuthGuardService } from '../services/auth-guard.service';

import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { SetPasswordComponent } from './accounts/set-password.component';
import { SsoComponent } from './accounts/sso.component';
import { TwoFactorComponent } from './accounts/two-factor.component';

import { SendComponent } from './send/send.component';

import { VaultComponent } from './vault/vault.component';

const routes: Routes = [
    { path: '', redirectTo: '/vault', pathMatch: 'full' },
    {
        path: 'lock',
        component: LockComponent,
        canActivate: [LockGuardService, VaultInstalledGuardService],
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [UnauthGuardService, VaultInstalledGuardService],
    },
    {
        path: '2fa',
        component: TwoFactorComponent,
        canActivate: [VaultInstalledGuardService],
    },
    { path: 'register', component: RegisterComponent },
    {
        path: 'vault',
        component: VaultComponent,
        canActivate: [AuthGuardService, VaultInstalledGuardService],
    },
    { path: 'hint', component: HintComponent },
    {
        path: 'set-password',
        component: SetPasswordComponent,
        canActivate: [VaultInstalledGuardService],
    },
    { path: 'sso', component: SsoComponent },
    {
        path: 'send',
        component: SendComponent,
        canActivate: [AuthGuardService, VaultInstalledGuardService],
    },
    {
        path: 'installation',
        component: InstallationPageComponent,
        canActivate: [VaultUninstalledGuardService],
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: true,
            /*enableTracing: true,*/
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
