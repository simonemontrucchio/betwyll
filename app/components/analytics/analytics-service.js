'use strict';

angular.module('myApp.analytics.analyticsService', [])

    .factory('Analytics', function($http) {
        var analyticsService = {
            getData: function () {
                //return $http.get('../data/pizza.json').then(function (response) {
                return $http.get('../data/alice.json').then(function (response) {
                    return response.data;
                });
            }
        };
        return analyticsService;
    });
