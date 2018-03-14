'use strict';

angular.module('myApp.analytics.singlePizzaService', [])

    .factory('SinglePizza', function($http) {
        var singlePizzaService = {
            getSinglePizza: function (pizzaId) {
                return $http.get('../data/pizza.json').then(function (response) {
                    var pizzaList = response.data;
                    var result = {};
                    //this is not the best way to do it but the most understandable (you should use $filter)
                    for (var i = 0; i < pizzaList.length; i++)
                    {
                        var pizza = pizzaList[i];
                        if (pizza.id === pizzaId) {
                            return pizza;
                        }
                    }
                    return {};
                });
            }
        };
        return singlePizzaService;
    });
