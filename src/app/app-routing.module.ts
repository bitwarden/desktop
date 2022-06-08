import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { LockGuard } from "jslib-angular/guards/lock.guard";

import { HintComponent } from "./accounts/hint.component";
import { LockComponent } from "./accounts/lock.component";
import { LoginComponent } from "./accounts/login.component";
import { RegisterComponent } from "./accounts/register.component";
import { RemovePasswordComponent } from "./accounts/remove-password.component";
import { SetPasswordComponent } from "./accounts/set-password.component";
import { SsoComponent } from "./accounts/sso.component";
import { TwoFactorComponent } from "./accounts/two-factor.component";
import { UpdateTempPasswordComponent } from "./accounts/update-temp-password.component";
import { LoginGuard } from "./guards/login.guard";
import { SendComponent } from "./send/send.component";
import { VaultComponent } from "./vault/vault.component";

const routes: Routes = [
  { path: "", redirectTo: "/vault", pathMatch: "full" },
  {
    path: "lock",
    component: LockComponent,
    canActivate: [LockGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  { path: "2fa", component: TwoFactorComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "vault",
    component: VaultComponent,
    canActivate: [AuthGuard],
  },
  { path: "hint", component: HintComponent },
  { path: "set-password", component: SetPasswordComponent },
  { path: "sso", component: SsoComponent },
  {
    path: "send",
    component: SendComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "update-temp-password",
    component: UpdateTempPasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "remove-password",
    component: RemovePasswordComponent,
    canActivate: [AuthGuard],
    data: { titleId: "removeMasterPassword" },
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
