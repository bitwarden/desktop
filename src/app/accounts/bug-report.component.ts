import { Component } from "@angular/core";

import { BugReportComponent as BugReportComponentBase } from "jslib-angular/components/bug-report.component";

export class BugReportComponent extends BugReportComponentBase {
  onSuccessfulSubmit(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
