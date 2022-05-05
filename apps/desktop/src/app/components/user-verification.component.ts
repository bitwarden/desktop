import { animate, style, transition, trigger } from "@angular/animations";
import { Component } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { UserVerificationComponent as BaseComponent } from "jslib-angular/components/user-verification.component";

@Component({
  selector: "app-user-verification",
  templateUrl: "user-verification.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UserVerificationComponent,
    },
  ],
  animations: [
    trigger("sent", [
      transition(":enter", [style({ opacity: 0 }), animate("100ms", style({ opacity: 1 }))]),
    ]),
  ],
})
export class UserVerificationComponent extends BaseComponent {}
