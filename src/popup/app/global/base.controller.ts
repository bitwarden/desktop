export class BaseController implements ng.IController {
    constructor($scope: any, i18nService: any) {
        $scope.i18n = i18nService;
    }
}

BaseController.$inject = ['$scope', 'i18nService'];
