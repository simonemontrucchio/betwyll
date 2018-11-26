'use strict';

angular.module('myApp.jsonView', ['ngMaterial', 'ngRoute', 'ngSanitize', 'myApp.analytics'])

    .directive("filesInput", function() {
        return {
            require: "ngModel",
            link: function postLink(scope,elem,attrs,ngModel) {
                elem.on("change", function(e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                })
            }
        }
    })

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/jsonView', {
            templateUrl: 'jsonView/jsonView.html',
            controller: 'JsonViewCtrl'
        });
    }])

    .controller('JsonViewCtrl', ['$scope', '$rootScope', '$http', 'Analytics',function($scope, $rootScope, $http, Analytics) {

        $rootScope.dati.currentView = 'json';

        $scope.analytics={};
        $scope.analytics.reformat = false;
        $scope.analytics.advanced = false;
        $scope.analytics.users = {};
        $scope.analytics.users.fiction_tip = "";
        $scope.analytics.users.fictional = [];
        $scope.analytics.hashtag_tip = "";


        $scope.analytics.twylls = {};
        $scope.analytics.twylls.first = "";
        $scope.analytics.twylls.last = "";

        $rootScope.json = {};
        $scope.json_new = {};
        $scope.answers = {};
        $rootScope.json.uploaded = false;

        $rootScope.info = {};




// analyze json file
        $scope.reformatJson = function() {

            $scope.json_new = $rootScope.json;

            var answers = [];

            //console.log("Entro in addJson");

            if ($rootScope.json.uploaded == true){

                $scope.analytics.comments = 0;
                $scope.analytics.answers = 0;

                // scorro ogni riga del file dei twyll
                for (var i = 0; i < $scope.json_new.length; i++) {

                    // se non è undefined entro nel capitolo
                    if($scope.json_new[i].comments != undefined){

                        if ($scope.json_new[i].comments.length != 0){
                            //console.log("NEW: " + JSON.stringify($scope.json_new[i].comments));
                            //$scope.analytics.comments += $rootScope.json[i].comments.length;


                            var j = $scope.json_new[i].comments.length -1;
                            for   (j; j >= 0 ; j--) {

                                //TODO aggiungere per ogni commento che si tratta di un commento





                                if ($scope.json_new[i].comments[j].answers != undefined) {

                                    //copio le risposte
                                    $scope.answers = $scope.json_new[i].comments[j].answers;



                                    //TODO togliere risposte da dentro commento




                                    //TODO mettere le risposte dopo il commento
                                    // 0 vuol dire che non rimuove ma aggiunge
                                    var k = $scope.answers.length -1;
                                    for   (k; k >= 0 ; k--) {


                                        console.log("aggiungo: " +$scope.json_new[i].comments[j].content + "---" + $scope.answers[k].content)
                                        $scope.json_new[i].comments.splice(j+1,0,$scope.answers[k]);

                                    }









                                    //TODO aggiungere per ogni risposta  che si tratta di una risposta o omettere?



                                    //TODO parse html del content


                                }
                            }
                        }
                    }
                }




                $scope.analytics.reformat = true;
                //console.log("analized vale: " + $scope.analytics.analyzed);


                $scope.download( JSON.stringify($scope.json_new), $rootScope.info.name.toString().replace(".json", "") + '-REFORMAT.json', 'application/json;charset=utf-8');

            }
        };

















        /*
        UPLOAD AND JSON MERGE
        Credits: https://labs.data.gov/dashboard/merge
         */
        var filesUploaded = [];
        $scope.readfiles = function(files) {
            //console.log("entro nel file read");

            var reader = new FileReader();
            function readFile(index) {
                if( index >= files.length ){

                    $rootScope.info.date = new Date(files[files.length-1].lastModified);
                    $rootScope.info.name = files[files.length-1].name;

                    //go to merge
                    $scope.mergeFiles();
                    return
                };
                var file = files[index];
                reader.onload = function(e) {
                    // get file content
                    var text = e.target.result;
                    //console.log(text)
                    filesUploaded.push(text)
                    // do sth with bin
                    readFile(index+1)
                }
                reader.readAsText(file);
            }
            readFile(0);
        }


        $scope.mergeFiles = function() {

            var allData = [];
            var open = '[';
            var close = ']';
            var separator = ',';
            allData = allData + open;

            for (var i = 0; i < filesUploaded.length; i++) {

                var text = filesUploaded[i];
                //console.log(text);
                var start = 0;
                var end = text.length-1;
                var partial = text.slice(1, -1);
                //console.log("partial n " + i + ": " + partial);

                if(i != 0){
                    allData = allData + separator + partial;
                }
                else {
                    allData = allData + partial;
                }

            }
            allData = allData + close;
            $rootScope.json = JSON.parse(allData);

            /* TODO RIMUOVERE DUPLICATI */
            $scope.debugDuplicati($rootScope.json);


            $scope.analytics.analyzed = false;



        };


        $scope.debugDuplicati = function (dataset) {
            var debugged = {};
            debugged = dataset;
            var duplicati = [];

            // scorro ogni riga del file dei twyll
            for (var i = 0; i < $rootScope.json.length; i++) {
                if (dataset[i].comments != undefined && dataset[i].comments.length != 0) {

                    for (var j = 0; j < dataset[i].comments.length; j++) {
                        var id = dataset[i].comments[j]._id;
                        var unique = true;
                        unique = $scope.ricercaDuplicati(dataset, i, j, id);
                        if (unique == false) {
                            duplicati.push([i,j]);
                        }
                    }
                }
            }



            var k = duplicati.length ;
            console.log("DUPLICATI TROVATI: " + k);
            k--;

            for (k; k >= 0; k--) {
                var par = duplicati[k][0];
                var com = duplicati[k][1];
                debugged[par].comments.splice(com, 1);
            }


            $rootScope.json = debugged;

            //$scope.download( JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DEBUGGED.json', 'application/json;charset=utf-8');

            $rootScope.json.uploaded = true;
        };


        $scope.ricercaDuplicati = function (dataset, i, j, id) {
            // console.log("id ricerca: " + id);
            for (var step = i; step < $rootScope.json.length; step++) {
                if (dataset[step].comments != undefined) {
                    for (var k = j+1; k < dataset[step].comments.length; k++) {
                        if (dataset[step].comments[k]._id == id) {
                            console.log("id trovato: " + dataset[step].comments[k]._id);
                            console.log("content trovato: " + dataset[step].comments[k].content);
                            return false;
                        }
                        if (dataset[step].comments[k].answers != undefined) {
                            for (var w = 0; w < dataset[step].comments[k].answers.length; w++) {
                                if (dataset[step].comments[k].answers[w]._id == id) {
                                    console.log("id trovato: " + dataset[step].comments[k].answers[w]._id);
                                    console.log("content trovato: " + dataset[step].comments[k].answers[w].content);
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
            return true;
        };


        /*
        $rootScope.json = debugged;

        $scope.download( JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DEBUGGED.json', 'application/json;charset=utf-8');
         */


        $scope.download = function (content, fileName, contentType) {
            var a = document.createElement("a");
            var file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        };


        $scope.exportTwylls = function (){
            var contents = $rootScope.contents;
            $scope.download(contents, $rootScope.info.name.toString().replace(".json", "") + '-TWYLLS.txt', 'text/txt;charset=utf-8');
        };


    }])





    .filter('trusted', function ($sce) {
            return function(val) {
                return $sce.trustAsHtml(val);
            };
        });









