import { BrowserApi } from '../../../browser/browserApi';

import { AuthService } from '../services/auth.service';

import { UtilsService } from 'jslib/abstractions/utils.service';

export class MainController implements ng.IController {
    smBody: boolean;
    xsBody: boolean;
    animation: string;

    constructor($scope: any, $transitions: any, $state: any, authService: AuthService, toastr: any,
        i18nService: any, $analytics: any, utilsService: UtilsService, $window: ng.IWindowService) {
        this.animation = '';
        this.xsBody = $window.screen.availHeight < 600;
        this.smBody = !this.xsBody && $window.screen.availHeight <= 800;

        $transitions.onSuccess({}, (transition: any) => {
            const toParams = transition.params('to');

            if (toParams.animation) {
                this.animation = toParams.animation;
            } else {
                this.animation = '';
            }
        });

        $window.bitwardenPopupMainMessageListener = (msg: any, sender: any, sendResponse: any) => {
            console.log(msg);
            
            if (msg.command === 'syncCompleted') {
                $scope.$broadcast('syncCompleted', msg.successfully);
            } else if (msg.command === 'syncStarted') {
                $scope.$broadcast('syncStarted');
            } else if (msg.command === 'doneLoggingOut') {
                authService.logOut(() => {
                    $analytics.eventTrack('Logged Out');
                    if (msg.expired) {
                        toastr.warning(i18nService.loginExpired, i18nService.loggedOut);
                    }
                    $state.go('home');
                });
            } else if (msg.command === 'collectPageDetailsResponse' &&
                msg.sender === 'currentController') {
                $scope.$broadcast('collectPageDetailsResponse', {
                    frameId: sender.frameId,
                    tab: msg.tab,
                    details: msg.details,
                });
            } else if (msg.command === '2faPageResponse') {
                $scope.$broadcast('2faPageResponse', {
                    type: msg.type,
                    data: msg.data,
                });
            }
        };

        BrowserApi.messageListener($window.bitwardenPopupMainMessageListener);
    }
}

MainController.$inject = ['$scope', '$transitions', '$state', 'authService', 'toastr', 'i18nService', '$analytics',
    'utilsService', '$window'];
