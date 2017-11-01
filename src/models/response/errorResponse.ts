class ErrorResponse {
    message: string;
    validationErrors: { [key: string]: string[]; };
    statusCode: number;

    constructor(response: any, identityResponse?: boolean) {
        let errorModel = null;
        if (identityResponse && response.responseJSON && response.responseJSON.ErrorModel) {
            errorModel = response.responseJSON.ErrorModel;
        } else if (response.responseJSON) {
            errorModel = response.responseJSON;
        } else if (response.responseText && response.responseText.indexOf('{') === 0) {
            errorModel = JSON.parse(response.responseText);
        }

        if (errorModel) {
            this.message = errorModel.Message;
            this.validationErrors = errorModel.ValidationErrors;
        }
        this.statusCode = response.status;
    }
}

export { ErrorResponse };
(window as any).ErrorResponse = ErrorResponse;
