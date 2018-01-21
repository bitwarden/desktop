import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { LoginComponent } from './accounts/login.component';
import { VaultComponent } from './vault/vault.component';

const routes: Routes = [
    { path: '', redirectTo: '/vault', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'vault', component: VaultComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
