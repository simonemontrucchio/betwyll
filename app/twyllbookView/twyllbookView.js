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

        $rootScope.info = {};

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



        $scope.doc_classes_colors = [
            "#ededed",  //grigino

            "#ECDB54",  //Meadowlark
            "#EADEDB",  //Almost Mauve
            "#F0EDE5",  //Coconut Milk
            "#ededed",  //grigino


            "#FFF5EE",  //seashell
            "#FFFAF0",  //floralwhite
            "#F0FFFF",  //azure
            "#FFF8DC",  //cornsilk
            "#FAFAD2",  //lightgoldenrodyellow
            "#F0F8FF",  //aliceblue
            "#DCDCDC",  //gainsboro
            "#FFE4E1",  //mistyrose
            "#FAEBD7",  //antiquewhite
            "#F5FFFA",  //mintcream
            "#FDF5E6",  //oldlace
            "#F8F8FF",  //ghostwhite
            "#FFFFF0",  //ivory
            "#F5F5DC",  //beige
            "#F5F5F5",  //whitesmoke
            "#E0FFFF",  //lightcyan
            "#F0FFF0",  //honeydew



            "#fff"      //white



        ];



        /***************
         * DYNAMICA CSS RULES
         *
         */
        var printSheet = "print.css";
        $rootScope.printSheet = {};
        var sheets = document.styleSheets; // returns an Array-like StyleSheetList
        for (var i = 0; i < sheets.length; i++) {
            var sheet = document.styleSheets[i];
            var href = document.styleSheets[i].href;
            if(href != null && href.includes(printSheet)) {
                $rootScope.printSheet = sheet;
                break
            }
        }
        //console.log($rootScope.printSheet);


        // TESTI
        $scope.titolo = "Titolo di esempio";

        // MARGINI
        $scope.margineSuperiore = 2;
        $scope.margineInferiore = 2;
        $scope.margineSinistro = 2;
        $scope.margineDestro = 2;



        $scope.impostazioni = function(selettore) {
            var selector = "." + selettore;
            var rules = "";

            if (selettore == "vivo"){
                rules = 'padding-top: ' + $scope.margineSuperiore * 10 + 'px !important;' +
                            'padding-bottom: ' + $scope.margineInferiore * 10 + 'px !important;' +
                            'padding-left: ' + $scope.margineSinistro * 10 + 'px !important;' +
                            'padding-right: ' + $scope.margineDestro * 10 + 'px !important;';
            }
            if (rules != ""){
                $scope.addCSSRule($rootScope.printSheet, selector, rules);
            }

            var x = (210 - ($scope.margineSinistro * 10) - ($scope.margineDestro * 10));
            var y = (297 - ($scope.margineSuperiore * 10) - ($scope.margineInferiore * 10));
            var dim = Math.min(x, y);
            rules = 'width: ' + dim + 'px !important;' +
                    'heigth: ' + dim + 'px !important;';
            selector = ".copertina";


            $scope.addCSSRule($rootScope.printSheet, selector, rules);
        };


        $scope.stampa = function(){
            var selector = "@page";
            var rules = "";


            // imposta margini della pagina
            rules = 'size: A4 !important;' +
                'margin: ' + $scope.margineSuperiore + 'cm ' + $scope.margineDestro + 'cm ' + $scope.margineInferiore + 'cm ' +  $scope.margineSinistro+ 'cm;';

            $scope.addCSSRule($rootScope.printSheet, selector, rules);



            rules = 'size: A4 !important;' +
                'margin: ' + $scope.margineSuperiore + 'cm ' + $scope.margineDestro + 'cm ' + $scope.margineInferiore + 'cm ' +  $scope.margineSinistro+ 'cm;';

            $scope.addCSSRule($rootScope.printSheet, selector, rules);









            window.print();
        };


        $scope.addCSSRule = function(sheet, selector, rules) {
            var regole = $rootScope.printSheet.cssRules || $rootScope.printSheet.rules;
            var i = -1;
            for (var j = 0; j < regole.length; j++) {
                var name = regole[j].selectorText;
                var text = regole[j].cssText;
                if (selector == name){
                    console.log("selettore trovato")
                    i = j;
                }
                else if (text.includes(selector)){
                   console.log("testo trovato")
                    i = j;
                }
            }
            var index = i;
            if("insertRule" in sheet) {
                sheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if("addRule" in sheet) {
                sheet.addRule(selector, rules, index);
            }
        };
    }])




    .filter('trusted', function ($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })

