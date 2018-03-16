'use strict';

angular.module('myApp.analyticsView', ['ngMaterial', 'ngRoute', 'ngSanitize', 'myApp.analytics'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/analyticsView', {
    templateUrl: 'analyticsView/analyticsView.html',
    controller: 'AnalyticsViewCtrl'
  });
}])

.controller('AnalyticsViewCtrl', ['$scope', '$rootScope', '$http', 'Analytics',function($scope, $rootScope, $http, Analytics) {

    $scope.analytics={};
    $scope.analytics.analyzed=false;
    $scope.analytics.advanced = false
    $scope.analytics.users = {};
    $scope.analytics.users.fiction_tip = "";
    $scope.analytics.users.fictional = [];


    $scope.analytics.twylls = {};
    $scope.analytics.twylls.first = "";
    $scope.analytics.twylls.last = "";

    $rootScope.json = {};
    $rootScope.json.uploaded = false;

    $rootScope.info = {};


    // save json file in global variable
    $('#json_file').change(function(e) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // console.log(e.target.result);

            //if you want in JSON use
            $rootScope.json = JSON.parse(e.target.result);
            $rootScope.json.uploaded = true;
            $scope.analytics.analyzed = false;
            //console.log("rootscope json vale: " + $rootScope.json);
        }
        reader.readAsText(this.files[0]);
        $rootScope.info.date = new Date(this.files[0].lastModifiedDate);
        $rootScope.info.name = this.files[0].name;

    });



    // analyze json file
    $scope.addJson = function() {

        if ($rootScope.json.uploaded == true){

            $scope.analytics.comments = 0;
            $scope.analytics.answers = 0;

            // scorro ogni riga del file dei twyll
            for (var i = 0; i < $rootScope.json.length; i++) {

                // se è undefined, sto cambiando capitolo
                if($rootScope.json[i].comments == undefined){
                    $scope.analytics.capitoli++;
                    // console.log("Capitolo: " + $rootScope.json[i].content);
                }

                // se non è undefined entro nel capitolo
                if($rootScope.json[i].comments != undefined){

                    // conto i twyll originali per ogni paragrafo
                    if ($rootScope.json[i].comments.length != 0){
                        $scope.analytics.comments += $rootScope.json[i].comments.length;
                        // console.log("Numero comments: " + $rootScope.json[i].comments.length);

                        for   (var j = 0; j < $rootScope.json[i].comments.length; j++) {

                            // se ci sono, conto i twyll di risposta
                            if ($rootScope.json[i].comments[j].answers != undefined) {
                                $scope.analytics.answers += $rootScope.json[i].comments[j].answers.length;
                                // console.log("Answers: " + $rootScope.json[i].comments[j].answers.length);
                            }
                        }
                    }
                }
            }
            $scope.analytics.analyzed=true;
        }
    };



    // chiama tutte le funzioni per le statistiche avanzate
    $scope.advanced = function() {



        if ($rootScope.json.uploaded == true) {

            $scope.usersCount();
            $scope.analytics.twyll_per_user = ($scope.analytics.answers + $scope.analytics.comments) / $scope.analytics.users.length;

            $scope.timeDevelopment();
            $scope.analytics.twyll_per_day = $scope.analytics.twylls.length / $scope.analytics.duration;


            $scope.analytics.advanced = true;

        }
    };




    // trova gli utenti attivi
    $scope.usersCount = function () {
        var users = [];
        var twylls = [];
        // scorro ogni riga del file dei twyll
        for (var i = 0; i < $rootScope.json.length; i++) {
            // se non è undefined entro nel capitolo
            if ($rootScope.json[i].comments != undefined) {
                // conto i twyll originali per ogni paragrafo
                if ($rootScope.json[i].comments.length != 0) {
                    for (var j = 0; j < $rootScope.json[i].comments.length; j++) {
                        users.push($rootScope.json[i].comments[j].user);

                        // aggiungi twyll ad array
                        twylls.push($rootScope.json[i].comments[j]);

                        // se ci sono, conto i twyll di risposta
                        if ($rootScope.json[i].comments[j].answers != undefined) {
                            for (var k = 0; k < $rootScope.json[i].comments[j].answers.length; k++) {
                                users.push($rootScope.json[i].comments[j].answers[k].user);
                               // $scope.analytics.users.push($rootScope.json[i].comments[j].answers[k].user);

                                // aggiungi twyll ad array
                                twylls.push($rootScope.json[i].comments[j].answers[k]);
                            }
                        }
                    }
                }
            }

        }
        $scope.analytics.users = $scope.rimuoviDuplicati(users);
        $scope.analytics.twylls = twylls;

        // trova possibili account finzionali
        for (var i = 0; i < $scope.analytics.users.length; i++) {
            if($scope.analytics.users[i].nickname != undefined && $scope.analytics.users[i].nickname.includes("tw")){
                if ($scope.analytics.users.fiction_tip != undefined){
                    $scope.analytics.users.fiction_tip = $scope.analytics.users.fiction_tip + ", " + $scope.analytics.users[i].nickname;
                }
                if ($scope.analytics.users.fiction_tip == undefined){
                    $scope.analytics.users.fiction_tip = $scope.analytics.users[i].nickname;
                }
            }
        }
    };


    // rimuove duplicati da un array
    $scope.rimuoviDuplicati = function(arr){
        var newArr = [];
        angular.forEach(arr, function(value, key) {
            var exists = false;
            angular.forEach(newArr, function(val2, key) {
                if(angular.equals(value.id, val2.id)){ exists = true };
            });
            if(exists == false && value.id != "") { newArr.push(value); }
        });
        return newArr;
    }


    // sviluppo nel tempo
    $scope.timeDevelopment = function(){
        $scope.analytics.twylls.first = $scope.analytics.twylls[0];
        $scope.analytics.twylls.first.date = new Date($scope.analytics.twylls[0].timestamp);
        $scope.analytics.twylls.last = $scope.analytics.twylls[0];
        $scope.analytics.twylls.last.date = new Date($scope.analytics.twylls[0].timestamp);

        for (var i = 0; i < $scope.analytics.twylls.length; i++) {
            if ($scope.analytics.twylls[i].timestamp < $scope.analytics.twylls.first.timestamp){
                $scope.analytics.twylls.first = $scope.analytics.twylls[i];
                $scope.analytics.twylls.first.date = new Date($scope.analytics.twylls[i].timestamp);
            }
            if ($scope.analytics.twylls[i].timestamp > $scope.analytics.twylls.last.timestamp){
                $scope.analytics.twylls.last = $scope.analytics.twylls[i];
                $scope.analytics.twylls.last.date = new Date($scope.analytics.twylls[i].timestamp);
            }
        }
        $scope.analytics.duration = $scope.timeDifference($scope.analytics.twylls.first.timestamp, $scope.analytics.twylls.last.timestamp);
    };


    $scope.timeDifference = function(date1, date2 ) {
        var difference = date2 - date1;
        return (difference / (60*60*24*1000));
    }



    // chiama tutte le funzioni per le statistiche sugli utenti finzionali
    $scope.fiction = function() {

        var fictionals = $scope.fiction_array(document.getElementById('fiction').value);
        console.log("Fictional array splitted 0: " + fictionals[0]);

        $scope.fictional_users(fictionals);

    };


    // input string separated by comma to array
    $scope.fiction_array = function(search) {
        //remove spaces and set it to lowercase
        search = search.replace(/\s/g, '').toLowerCase();
        return search.split(",");
    }


    $scope.fictional_users = function(list) {
        var fictional = [];
        for (var i = 0; i < $scope.analytics.users.length; i++) {
            if(list.indexOf($scope.analytics.users[i].nickname) != -1){
                fictional.push($scope.analytics.users[i]);
            }
        }
        $scope.analytics.users.fictional = fictional;
        for (var i = 0; i < $scope.analytics.users.fictional.length; i++) {
            console.log("Utenti finzionali: " + $scope.analytics.users.fictional[i].nickname + " | " + $scope.analytics.users.fictional[i].id);
        }
    }
}])


.filter('trusted', function ($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
