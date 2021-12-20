import { animate, style, transition, trigger } from "@angular/animations";
import { Component } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { VerifyMasterPasswordComponent as BaseComponent } from "jslib-angular/components/verify-master-password.component";

@Component({
  selector: "app-verify-master-password",
  templateUrl: "verify-master-password.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: VerifyMasterPasswordComponent,
    },
  ],
  animations: [
    trigger("sent", [
      transition(":enter", [style({ opacity: 0 }), animate("100ms", style({ opacity: 1 }))]),
    ]),
  ],
})
export class VerifyMasterPasswordComponent extends BaseComponent {}
