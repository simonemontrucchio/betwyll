'use strict';

angular.module('myApp.analyticsView', ['ngRoute','myApp.analytics'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/analyticsView', {
    templateUrl: 'analyticsView/analyticsView.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope','Analytics',function($scope, Analytics) {
    Analytics.getData().then(function(data) {
        $scope.dati={};
        $scope.dati.twylls = data;

        $scope.dati.comments = 0;

        $scope.info={};
        $scope.info.comments = 0;
        $scope.info.answers = 0;

        $scope.info.capitoli = 0;

        // scorro ogni riga del file dei twyll
        for (var i = 0; i < $scope.dati.twylls.length; i++) {

            // console.log("Paragrafo: " + $scope.dati.twylls[i].id);

            // se è undefined, sto cambiando capitolo
            if($scope.dati.twylls[i].comments == undefined){
                $scope.info.capitoli++;
                console.log("Capitolo: " + $scope.dati.twylls[i].content);
            }

            // se non è undefined entro nel capitolo
            if($scope.dati.twylls[i].comments != undefined){

                // conto i twyll originali per ogni paragrafo
                if ($scope.dati.twylls[i].comments.length != 0){
                    $scope.info.comments += $scope.dati.twylls[i].comments.length;
                    // console.log("Numero comments: " + $scope.dati.twylls[i].comments.length);

                    // se ci sono, conto i twyll di risposta
                    for   (var j = 0; j < $scope.dati.twylls[i].comments.length; j++) {
                        if ($scope.dati.twylls[i].comments[j].answers != undefined) {
                            $scope.info.answers += $scope.dati.twylls[i].comments[j].answers.length;
                            // console.log("Answers: " + $scope.dati.twylls[i].comments[j].answers.length);
                        }
                    }

                }
            }

        }
    });
}]);