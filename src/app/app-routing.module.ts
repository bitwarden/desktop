import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorComponent } from './accounts/two-factor.component';

import { VaultComponent } from './vault/vault.component';

const routes: Routes = [
    { path: '', redirectTo: '/vault', pathMatch: 'full' },
    { path: 'lock', component: LockComponent },
    { path: 'login', component: LoginComponent },
    { path: '2fa', component: TwoFactorComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'vault',
        component: VaultComponent,
        canActivate: [AuthGuardService],
    },
    { path: 'hint', component: HintComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
