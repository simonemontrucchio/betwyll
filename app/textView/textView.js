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
    $scope.interruzione = false;
    $scope.cifre = false;
    $scope.corpo = "";
    $scope.newsletter = true;
    $scope.immagine = "http://www.betwyll.com/website/wp-content/uploads/2018/10/bg-progetto.jpg";
    $scope.call1 = "Ti è piaciuto questo progetto?";
    $scope.call2 = "Rimani aggiornato sui prossimi!";



    $scope.intestazione_html = "";
    $scope.titolo_html = "";
    $scope.sottotitolo_html = "";
    $scope.corpo_html = "";
    $scope.interruzione_html = "";
    $scope.newsletter_html = "";

    $scope.conversione = "";
    $scope.copied = "";




    $scope.setHeader = function () {
        $scope.intestazione_html = "";

        if ($scope.dataInizio != "" && $scope.dataFine == "" && $scope.hashtag == ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataInizio + "]" + '</em></h4>';
        }

        if ($scope.dataInizio != "" && $scope.dataFine != "" && $scope.hashtag == ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataInizio + " - " + $scope.dataFine + "]" + '</em></h4>';
        }

        if ($scope.dataInizio != "" && $scope.dataFine == "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataInizio + " | " + $scope.hashtag + "]" + '</em></h4>';
        }
        if ($scope.dataInizio != "" && $scope.dataFine != "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataInizio + " - " + $scope.dataFine + " | " + $scope.hashtag + "]" + '</em></h4>';
        }
        if ($scope.dataInizio == "" && $scope.dataFine == "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.hashtag  + "]" + '</em></h4>';
        }

        if ($scope.dataInizio == "" && $scope.dataFine != "" && $scope.hashtag != ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataFine + " | " + $scope.hashtag  + "]" + '</em></h4>';
        }

        if ($scope.dataInizio == "" && $scope.dataFine != "" && $scope.hashtag == ""){
            $scope.intestazione_html = '<h4><em>' + "[" + $scope.dataFine + "]" + '</em></h4>';
        }

    };

    $scope.setTitle = function () {
        $scope.titolo_html = "";
        var id = $scope.numero;
        if ($scope.titolo != ""){
            $scope.titolo_html = '<p id="par-' + id + '" style="font-size:1.3em;"><strong>' + $scope.titolo + '</strong></p>';
        }
    };



    $scope.setSubTitle = function () {
        $scope.sottotitolo_html = "";
        var id = $scope.numero + 1 ;
        if ($scope.sottotitolo != ""){
            $scope.sottotitolo_html = '<p id="par-' + id + '"><em>' + $scope.sottotitolo + '</em><br><br></p>';
        }

    };


    $scope.setBody = function () {
        $scope.corpo_html = "";

        var re1 = /<1br \/><1br \/>/gi;             //trova i singoli a capo
        var re1a = /<1br \/><1br \/><1br \/>/gi;    // trova i nuovi paragrafi
        var re2 = /\<1br \/>/gi;
        var re4 = /<2br \/>/gi;
        var cifre = /[0-9]/gi;


        if ($scope.corpo != ""){
            //$scope.corpo_html = $scope.corpo.replace(/\r/g, '<p/>');
            //$scope.corpo_html = '<p>' + $scope.corpo + '</p>';
            $scope.corpo_html = $scope.corpo.replace(/(\r\n|\n|\r)/gm,"<1br />");

            $scope.corpo_html =  $scope.corpo_html.replace(re1a,"<1br /><2br />");
            $scope.corpo_html =  $scope.corpo_html.replace(re1,"<2br />");


            $scope.corpo_html = $scope.corpo_html.replace(re2, "<br>\n");


            $scope.corpo_html = $scope.corpo_html.replace(re4,"<br></p>\n\n<p>");


            // rimuovi cifre
            if ($scope.cifre == true) {
                $scope.corpo_html = $scope.corpo_html.replace(cifre,"");
            }




            $scope.corpo_html =  '<p>' + $scope.corpo_html + '</p>';



            var search = '<p>';
            var id = $scope.numero + 1;
            id++;


            $scope.corpo_html = $scope.corpo_html.replace(new RegExp(search, 'g'), function () {
                return '<p id="par-'+ id++ + '">';
            });



        }
        $scope.setNewsletter();

    };

    $scope.setInterruption = function () {
        if ($scope.interruzione) {
            $scope.interruzione_html = '<hr data-betwyll="on-new-page"/>';
        }
        else {
            $scope.interruzione_html = '';
        }
    };





    $scope.setNewsletter = function () {
        if ($scope.newsletter) {
            $scope.newsletter_html = '<div style="\n' +
                'background: url(' + $scope.immagine + ');\n' +
                'background-position: top left;\n' +
                'background-size: cover;\n' +
                'height: 190px;\n' +
                'margin: 0 -50px 0 -25px;\n' +
                'padding: 19px;">\n' +
                '  <div style="\n' +
                '  color: #fff;\n' +
                '  padding-bottom: 38px;">\n' +
                '    <h2 style="color:#fff;margin:0px;">' + $scope.call1 + '</h2>\n' +
                '    <p style="margin-top:10px; ">' + $scope.call2 + '</p>\n' +
                '  </div>\n' +
                '  <div class="text-center">\n' +
                '    <a class="btn btn-link"  style="\n' +
                'background-color: #b2045e;\n' +
                'color:#fff;"\n' +
                'href="http://www.betwyll.com/website/it/newsletter/">\n' +
                '      <span>Iscriviti alla newsletter</span>\n' +
                '      <i class="icon ion-android-mail"></i>\n' +
                '    </a>\n' +
                '  </div>\n' +
                '</div>';
        }
        else {
            $scope.newsletter_html = '';
        }
    };



    $scope.setImage = function () {
        $scope.setNewsletter();
    };

    $scope.setCall1 = function () {
        $scope.setNewsletter();
    };

    $scope.setCall2 = function () {
        $scope.setNewsletter();
    };






    $scope.setDigits = function () {
        $scope.setBody();
    };

    $scope.setNumber = function () {
        $scope.setHeader();
        $scope.setTitle();
        $scope.setSubTitle();
        $scope.setDigits();
        $scope.setBody();
        $scope.setInterruption();
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


