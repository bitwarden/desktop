import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { HomeComponent } from './accounts/home.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { TabsComponent } from './tabs.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CurrentTabComponent } from './vault/current-tab.component';
import { GroupingsComponent } from './vault/groupings.component';
import { ViewComponent } from './vault/view.component';

const routes: Routes = [
    { path: '', redirectTo: '/tabs/current', pathMatch: 'full' },
    { path: 'vault', redirectTo: '/tabs/vault', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'lock', component: LockComponent },
    { path: '2fa', component: TwoFactorComponent },
    { path: '2fa-options', component: TwoFactorOptionsComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'hint', component: HintComponent },
    { path: 'environment', component: EnvironmentComponent },
    { path: 'ciphers', component: CiphersComponent },
    { path: 'view-cipher', component: ViewComponent },
    {
        path: 'tabs', component: TabsComponent,
        children: [
            { path: '', redirectTo: '/tabs/vault', pathMatch: 'full' },
            {
                path: 'current',
                component: CurrentTabComponent,
                canActivate: [AuthGuardService],
            },
            {
                path: 'vault',
                component: GroupingsComponent,
                canActivate: [AuthGuardService],
            }
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
