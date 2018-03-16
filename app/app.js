'use strict';

// Declare app level module which depends on views, and components


angular.module('myApp', [
    'ngMaterial',
  'ngRoute',
  'ngSanitize',
  'myApp.analyticsView',
    'myApp.analytics',
    'myApp.detailsView'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/analyticsView'});
}]);