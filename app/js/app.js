'use strict';


// Declare app level module which depends on filters, and services
angular.module('IsoGame', ['IsoGame.controllers']);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['IsoGame']);
});
