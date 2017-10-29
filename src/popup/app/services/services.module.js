import StateService from './state.service';

angular
    .module('bit.services', ['toastr'])
    .service('stateService', StateService);
