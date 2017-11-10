class ErrorResponse {
    message: string;
    validationErrors: { [key: string]: string[]; };
    statusCode: number;

    constructor(response: any, status: number, identityResponse?: boolean) {
        let errorModel = null;
        if (identityResponse && response && response.ErrorModel) {
            errorModel = response.ErrorModel;
        } else if (response) {
            errorModel = response;
        //} else if (response.responseText && response.responseText.indexOf('{') === 0) {
        //    errorModel = JSON.parse(response.responseText);
        }

        if (errorModel) {
            this.message = errorModel.Message;
            this.validationErrors = errorModel.ValidationErrors;
        }
        this.statusCode = status;
    }
}

export { ErrorResponse };
(window as any).ErrorResponse = ErrorResponse;
