export class TabsController implements ng.IController {
    constructor($scope: any, $state: any, i18nService: any) {
        $scope.$state = $state;
        $scope.i18n = i18nService;
    }
}
