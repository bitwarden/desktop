import { DatePipe } from "@angular/common";
import { Component, OnChanges } from "@angular/core";
import { ControlContainer, NgForm } from "@angular/forms";

import { EffluxDatesComponent as BaseEffluxDatesComponent } from "jslib-angular/components/send/efflux-dates.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-send-efflux-dates",
  templateUrl: "efflux-dates.component.html",
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class EffluxDatesComponent extends BaseEffluxDatesComponent implements OnChanges {
  constructor(
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected datePipe: DatePipe
  ) {
    super(i18nService, platformUtilsService, datePipe);
  }

  // We reuse the same form on desktop and just swap content, so need to watch these to maintin proper values.
  ngOnChanges() {
    this.selectedExpirationDatePreset.setValue(0);
    this.selectedDeletionDatePreset.setValue(0);
    this.defaultDeletionDateTime.setValue(
      this.datePipe.transform(new Date(this.initialDeletionDate), "yyyy-MM-ddTHH:mm")
    );
    if (this.initialExpirationDate) {
      this.defaultExpirationDateTime.setValue(
        this.datePipe.transform(new Date(this.initialExpirationDate), "yyyy-MM-ddTHH:mm")
      );
    } else {
      this.defaultExpirationDateTime.setValue(null);
    }
  }
}
