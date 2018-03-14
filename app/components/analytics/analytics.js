'use strict';

angular.module('myApp.analytics', [
    'myApp.analytics.analyticsService',
    'myApp.analytics.singlePizzaService'
])

.value('version', '0.1');
