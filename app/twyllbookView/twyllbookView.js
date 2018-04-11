'use strict';

angular.module('myApp.twyllbookView', ['ngMaterial', 'ngRoute', 'ngSanitize', 'myApp.analytics'])

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
        $routeProvider.when('/twyllbookView', {
            templateUrl: 'twyllbookView/twyllbookView.html',
            controller: 'TwyllbookViewCtrl'
        });
    }])

    .controller('TwyllbookViewCtrl', ['$scope', '$rootScope', '$http', 'Analytics',function($scope, $rootScope, $http, Analytics) {
        $rootScope.dati.currentView = 'twyllbook';

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

                    $rootScope.info.date = new Date(files[files.length-1].lastModifiedDate);
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
            //console.log(allData);

            $rootScope.json = JSON.parse(allData);
            $rootScope.json.uploaded = true;

            // chiama la funzione di download
            //$scope.download(allData, 'merged.json', 'application/json;charset=utf-8');

            //$scope.addJson();

        };


        $scope.download = function (content, fileName, contentType) {
            var a = document.createElement("a");
            var file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        };


        $scope.exportTwylls = function (){
            var contents = $rootScope.contents;
            $scope.download(contents, 'twylls.txt', 'text/txt;charset=utf-8');
        };


        $scope.string_to_array_multi = function(search) {
            search = search.toLowerCase();
            return search.split(", ");
        };





    }])




    .filter('trusted', function ($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })

