import { Injectable } from "@angular/core";

import { PasswordRepromptService as BasePasswordRepromptService } from "jslib-angular/services/passwordReprompt.service";

import { PasswordRepromptComponent } from "../app/components/password-reprompt.component";

@Injectable()
export class PasswordRepromptService extends BasePasswordRepromptService {
  component = PasswordRepromptComponent;
}
