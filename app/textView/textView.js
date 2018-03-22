'use strict';

angular.module('myApp.textView', ['ngRoute', 'myApp.analytics'])




.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/textView', {
    templateUrl: 'textView/textView.html',
    controller: 'textViewCtrl'
  });
}])


.controller('textViewCtrl', ['$scope', '$routeParams', function($scope, $rootScope) {

    $scope.dataInizio = "";
    $scope.dataFine = "";
    $scope.hashtag = "";
    $scope.titolo = "";
    $scope.sottotitolo = "";
    $scope.corpo = "";

    $scope.intestazione_html = "";
    $scope.titolo_html = "";
    $scope.sottotitolo_html = "";
    $scope.corpo_html = "";

    $scope.conversione = "";
    $scope.copied = "";


    $scope.setHeader = function () {
        $scope.intestazione_html = "";

        if ($scope.dataInizio != "" && $scope.dataFine == "" && $scope.hashtag == ""){
            $scope.intestazione_html = '<h3><em>' + "[" + $scope.dataInizio + "]" + '</em></h3>';
        }

        if ($scope.dataInizio != "" && $scope.dataFine != "" && $scope.hashtag == ""){
            $scope.intestazione_html = '<h3><em>' + "[" + $scope.dataInizio + " - " + $scope.dataFine + "]" + '</em></h3>';
        }

        if ($scope.dataInizio != "" && $scope.dataFine == "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h3><em>' + "[" + $scope.dataInizio + " | " + '<a>' + $scope.hashtag + '</a>'  + "]" + '</em></h3>';
        }
        if ($scope.dataInizio != "" && $scope.dataFine != "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h3><em>' + "[" + $scope.dataInizio + " - " + $scope.dataFine + " | " + '<a>' + $scope.hashtag + '</a>'  + "]" + '</em></h3>';
        }
        if ($scope.dataInizio == "" && $scope.dataFine == "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h3><em>' + "[" + '<a>' + $scope.hashtag + '</a>'  + "]" + '</em></h3>';
        }

    };

    $scope.setTitle = function () {
        $scope.titolo_html = "";
        if ($scope.titolo != ""){
            $scope.titolo_html = '<h3><strong>' + $scope.titolo + '</strong></h3>';
        }
    };

    $scope.setSubitle = function () {
        $scope.sottotitolo_html = "";
        if ($scope.sottotitolo != ""){
            $scope.sottotitolo_html = '<i>' + $scope.sottotitolo + '<br><br></i>';
        }

    };

    $scope.setBody = function () {
        $scope.corpo_html = "";

        var re1 = /<1br \/><1br \/>/gi;             //trova i singoli a capo
        var re1a = /<1br \/><1br \/><1br \/>/gi;    // trova i nuovi paragrafi


        if ($scope.corpo != ""){
            //$scope.corpo_html = $scope.corpo.replace(/\r/g, '<p/>');
            //$scope.corpo_html = '<p>' + $scope.corpo + '</p>';
            $scope.corpo_html = $scope.corpo.replace(/(\r\n|\n|\r)/gm,"<1br />");

            $scope.corpo_html =  $scope.corpo_html.replace(re1a,"<1br /><2br />");
            $scope.corpo_html =  $scope.corpo_html.replace(re1,"<2br />");


            var re2 = /\<1br \/>/gi;
            $scope.corpo_html = $scope.corpo_html.replace(re2, "<br>\n");

            var re4 = /<2br \/>/gi;
            $scope.corpo_html = $scope.corpo_html.replace(re4,"<br></p>\n\n<p>");


            $scope.corpo_html =  '<p>' + $scope.corpo_html + '</p>';

            /*


            var re3 = /\s+/g;
            $scope.corpo_html = $scope.corpo_html.replace(re3," ");


            */
        }







    };

    $scope.copy = function () {
        $scope.copied = "Copiato!";
    };

    /*
    $scope.convert = function () {
        $scope.conversione =    $scope.intestazione_html +
                                $scope.titolo_html +
                                $scope.sottotitolo_html +
                                $scope.corpo_html;
    }
    */




}]);