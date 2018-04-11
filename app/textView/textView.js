'use strict';

angular.module('myApp.textView', ['ngRoute', 'myApp.analytics'])




.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/textView', {
    templateUrl: 'textView/textView.html',
    controller: 'textViewCtrl'
  });
}])


.controller('textViewCtrl', ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {

    $rootScope.dati.currentView = 'text';

    $scope.dataInizio = "";
    $scope.dataFine = "";
    $scope.hashtag = "";
    $scope.titolo = "";
    $scope.sottotitolo = "";
    $scope.numero = 1;
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
            $scope.sottotitolo_html = '<p id="par-1"><em>' + $scope.sottotitolo + '</em><br><br></p>';
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

            console.log($scope.corpo_html);

            var search = '<p>';
            var id = $scope.numero;
            id++;

            $scope.corpo_html = $scope.corpo_html.replace(new RegExp(search, 'g'), function () {
                return '<p id="par-'+ id++ + '">';
            });
        }


    };

    $scope.copy = function () {
        /* Get the text field */
        var copyText = document.getElementById("converted");

        /* Select the text field */
        copyText.select();

        /* Copy the text inside the text field */
        document.execCommand("Copy");

        /* Alert the copied text */
        //alert("Copied the text: " + copyText.value);

        $scope.copied = "Copiato!";
        $timeout(function(){$scope.copied = ""}, 2000);

    };



}]);


