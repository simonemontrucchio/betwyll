'use strict';

angular.module('myApp.detailsView', ['ngRoute','myApp.analytics'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/detailsPizza/:pizzaId', {
    templateUrl: 'detailsView/detailsView.html',
    controller: 'detailsViewCtrl'
  });
}])
//Inline Array Annotation
    //Here we pass an array whose elements consist of a list of strings (the names of the dependencies)
    // followed by the function itself.
    //When using this type of annotation, take care to keep the annotation array
    // in sync with the parameters in the function declaration.
.controller('detailsViewCtrl', ['$scope', '$routeParams', 'SinglePizza',
    function($scope, $routeParams, SinglePizza) {
        SinglePizza.getSinglePizza($routeParams.pizzaId).then(function(data) {
            $scope.dati = {};
            $scope.dati.pizza = data;
        });
    }]);