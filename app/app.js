'use strict';

// Declare app level module which depends on views, and components


angular.module('myApp', [
    'ngMaterial',
  'ngRoute',
  'ngSanitize',
    'myApp.analyticsView',
    'myApp.analytics',
    'myApp.textView',
    'myApp.twyllbookView',
    'myApp.jsonView'
])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/analyticsView'});
}])


.controller('MainCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $rootScope.dati = {};
    $rootScope.dati.currentView = 'analytics';




}]);

