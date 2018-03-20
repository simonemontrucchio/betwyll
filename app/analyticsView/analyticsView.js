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
    $scope.analytics.hashtag_tip = "";


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
                        if ($rootScope.json[i].comments[j].answersCount == undefined){
                            $rootScope.json[i].comments[j].answersCount = 0;
                        }
                        twylls.push($rootScope.json[i].comments[j]);

                        // se ci sono, conto i twyll di risposta
                        if ($rootScope.json[i].comments[j].answers != undefined) {
                            for (var k = 0; k < $rootScope.json[i].comments[j].answers.length; k++) {
                                users.push($rootScope.json[i].comments[j].answers[k].user);

                                // aggiungi twyll ad array
                                $rootScope.json[i].comments[j].answers[k].answersCount = 0;
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
                    $scope.analytics.users.fiction_tip = $scope.analytics.users.fiction_tip + ", @" + $scope.analytics.users[i].nickname;
                }
                if ($scope.analytics.users.fiction_tip == undefined){
                    $scope.analytics.users.fiction_tip = "@" + $scope.analytics.users[i].nickname;
                }
            }
        }
    };





    // sviluppo nel tempo
    $scope.timeDevelopment = function(){
        $scope.analytics.twylls.first = $scope.analytics.twylls[0];
        $scope.analytics.twylls.first.date = new Date($scope.analytics.twylls[0].timestamp);
        $scope.analytics.twylls.last = $scope.analytics.twylls[0];
        $scope.analytics.twylls.last.date = new Date($scope.analytics.twylls[0].timestamp);

        for (var i = 0; i < $scope.analytics.twylls.length; i++) {


            // find hashtags
            var text = $scope.analytics.twylls[i].content.split(/[ /&]+/);
            for (var j = 0; j < text.length; j++) {
                if (text[j].includes("#")){
                    var n = text[j].indexOf("#");
                    //console.log("tip: " + $scope.analytics.hashtag_tip);
                    //console.log("end: " + text[j][text[j].length - 1]);
                    if(text[j][n-1] == undefined && isNaN(text[j][n+1]) && isNaN(text[j][text[j].length - 1]) && text[j] != " " &&!$scope.analytics.hashtag_tip.includes(text[j])){
                        if ($scope.analytics.hashtag_tip != " "){
                            $scope.analytics.hashtag_tip = $scope.analytics.hashtag_tip + ", " + text[j];
                        }
                        if ($scope.analytics.hashtag_tip == " "){
                            $scope.analytics.hashtag_tip = text[j];
                        }
                    }

                }

            }
            $scope.analytics.twylls[i].hashtag = false;



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
    };



    /*
    FICTION
     */
    $scope.fiction = function() {

        var fictionals = $scope.fiction_array(document.getElementById('fiction').value);
        //console.log("Fictional array splitted 0: " + fictionals[0]);

        $scope.fictional_users(fictionals);

        $scope.fictional_interactions();

    };

    // input string separated by comma to array
    $scope.fiction_array = function(search) {
        //remove spaces and set it to lowercase
        search = search.replace(/@|\s/g, '').toLowerCase();
        return search.split(",");
    };

    $scope.fictional_users = function(list) {
        $scope.analytics.users.fictional = {};
        var fictional = [];
        for (var i = 0; i < $scope.analytics.users.length; i++) {
            if(list.indexOf($scope.analytics.users[i].nickname) != -1){
                fictional.push($scope.analytics.users[i]);
            }
        }
        $scope.analytics.users.fictional = fictional;
    };


    $scope.fictional_interactions = function() {

        for (var i = 0; i < $scope.analytics.users.length; i++) {

            for (var j = 0; j < $scope.analytics.users.fictional.length; j++) {
                var twylls = [];
                var twyllsCount = 0;
                var answersCount = 0;


                if ($scope.analytics.users[i].nickname == $scope.analytics.users.fictional[j].nickname){
                    for (var k = 0; k < $scope.analytics.twylls.length; k++) {
                        if ($scope.analytics.twylls[k].user.nickname == $scope.analytics.users.fictional[j].nickname){
                            twylls.push($scope.analytics.twylls[k]);
                            twyllsCount++;
                            answersCount = answersCount + $scope.analytics.twylls[k].answersCount;
                        }
                    }
                    $scope.analytics.users.fictional[j].twylls = twylls;
                    $scope.analytics.users.fictional[j].twyllsCount = twyllsCount;
                    $scope.analytics.users.fictional[j].answersCount = answersCount;
                }
            }
        }
    };




    /*
    HASHTAG
     */
    $scope.hashtag = function() {

        var hashtags = $scope.hashtag_array(document.getElementById('hashtag').value);
        console.log("hashtag array splitted: " + hashtags);

        if (hashtags[0] != ""){
            $scope.hashtag_twylls(hashtags);
        }




    };

    // input string separated by comma to array
    $scope.hashtag_array = function(search) {
        //remove spaces and set it to lowercase
        search = search.replace(/\s/g, '').toLowerCase();
        return search.split(",");
    };

    $scope.hashtag_twylls = function(list) {
        $scope.analytics.hashtag = 0;
        for (var i = 0; i < $scope.analytics.twylls.length; i++) {

            $scope.analytics.twylls[i].hashtag = false;

            for (var j = 0; j < list.length; j++) {
                if($scope.analytics.twylls[i].content.toLowerCase().indexOf(list[j]) != -1){
                    $scope.analytics.hashtag++;
                    $scope.analytics.twylls[i].hashtag = true;
                    //console.log("Twyll trovato: " +$scope.analytics.twylls[i].content + " con hashtag: " + list[j]);
                    break;
                }
            }
        }
        console.log("Twyll con hashtag: " + $scope.analytics.hashtag);
    };

    $scope.hasHashtag = function(twyll) {
        if (twyll.hashtag == true){
            return true;
        }
        else return false;
    }



}])


.filter('trusted', function ($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})
