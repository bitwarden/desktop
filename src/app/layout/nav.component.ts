import { Component } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";

@Component({
  selector: "app-nav",
  templateUrl: "nav.component.html",
})
export class NavComponent {
  items: any[] = [
    {
      link: "/vault",
      icon: "bwi-lock-f",
      label: this.i18nService.translate("myVault"),
    },
    {
      link: "/send",
      icon: "bwi-send-f",
      label: "Send",
    },
  ];

  constructor(private i18nService: I18nService) {}
}
