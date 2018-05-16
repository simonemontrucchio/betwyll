'use strict';

angular.module('myApp.analyticsView', ['ngMaterial', 'ngRoute', 'ngSanitize', 'myApp.analytics'])

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
        $routeProvider.when('/analyticsView', {
            templateUrl: 'analyticsView/analyticsView.html',
            controller: 'AnalyticsViewCtrl'
        });
    }])

    .controller('AnalyticsViewCtrl', ['$scope', '$rootScope', '$http', 'Analytics',function($scope, $rootScope, $http, Analytics) {

        $rootScope.dati.currentView = 'analytics';

        $scope.analytics={};
        $scope.analytics.analyzed = false;
        $scope.analytics.advanced = false;
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

        $rootScope.contents = "";
        $scope.numero = 4;
        $scope.esclusione = "";

        $scope.dandelioneu = {};
        $scope.dandelioneu.entity = 0;
        $scope.dandelioneu.sentiment = 0;
        $scope.dandelioneu.classification = 0;
        $scope.dandelioneu.total = 0;





// analyze json file
        $scope.addJson = function() {

            //console.log("Entro in addJson");

            if ($rootScope.json.uploaded == true){

                $scope.analytics.comments = 0;
                $scope.analytics.answers = 0;

                // scorro ogni riga del file dei twyll
                for (var i = 0; i < $rootScope.json.length; i++) {

                    // se non è undefined entro nel capitolo
                    if($rootScope.json[i].comments != undefined){

                        // conto i twyll originali per ogni paragrafo
                        if ($rootScope.json[i].comments.length != 0){
                            $scope.analytics.comments += $rootScope.json[i].comments.length;


                            for   (var j = 0; j < $rootScope.json[i].comments.length; j++) {

                                // se ci sono, conto i twyll di risposta
                                if ($rootScope.json[i].comments[j].answers != undefined) {
                                    $scope.analytics.answers += $rootScope.json[i].comments[j].answers.length;
                                    // console.log("Answers: " + $rootScope.json[i].comments[j]._id);
                                    // console.log("Answers: " + $rootScope.json[i].comments[j].answers.length);
                                }
                            }
                        }
                    }
                }
                $scope.analytics.analyzed = true;
                //console.log("analized vale: " + $scope.analytics.analyzed);
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


            // initialize length vars
            var comments_len = 0;
            var answers_len = 0;
            var twylls_len = 0;
            $scope.analytics.comments_avgLen = 0;
            $scope.analytics.answers_avgLen = 0;
            $scope.analytics.twylls_avgLen = 0;

            var contents = "";

            for (var i = 0; i < $scope.analytics.twylls.length; i++) {

                //per ogni twyll faccio il parsing html del contenuto
                var text = $scope.htmlParser($scope.analytics.twylls[i].content);

                // aggiungo ogni twyll a un unico testo
                contents = contents.concat(" | " + text);



                twylls_len = twylls_len + text.length;
                if ($scope.analytics.twylls[i].answerToId != undefined){
                    answers_len = answers_len + text.length;
                }
                else {
                    comments_len = comments_len + text.length;
                }

                // find hashtags
                text = $scope.analytics.twylls[i].content.split(/[ /&]+/);
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

            $scope.analytics.comments_avgLen = comments_len / $scope.analytics.comments;
            $scope.analytics.answers_avgLen = answers_len / $scope.analytics.answers;
            $scope.analytics.twylls_avgLen = twylls_len / $scope.analytics.twylls.length;

            $scope.analytics.duration = $scope.timeDifference($scope.analytics.twylls.first.timestamp, $scope.analytics.twylls.last.timestamp);


            $rootScope.contents = contents;


        };


        $scope.htmlParser = function(html) {
            var div = document.getElementById("parser");
            div.innerHTML = html;
            return div.textContent || div.innerText || "";
        }


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

            var fictionals = $scope.string_to_array(document.getElementById('fiction').value);
            //console.log("Fictional array splitted 0: " + fictionals[0]);

            $scope.fictional_users(fictionals);

            $scope.fictional_interactions();

        };

// input string separated by comma to array
        $scope.string_to_array = function(search) {
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

            $scope.addJson();

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

            $scope.download( JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DEBUGGED.json', 'application/json;charset=utf-8');

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


        $scope.filterTwylls = function (){

            var contents = $rootScope.contents;
            var num = document.getElementById('number').value;
            var word_exclude = "";
            var exclude = $scope.string_to_array(document.getElementById('exclusion').value);

            // exclude nicknames and tag
            var contents = $scope.noTags(contents);

            // exclude words
            if (exclude != ""){
                for (var i = 0; i < exclude.length; i++) {
                    word_exclude = word_exclude.concat('\\s' + exclude[i] + '\\s' + "|");
                }
                var word_exclude = word_exclude.substring(0, word_exclude.length-1);
                contents = $scope.noWords(contents, word_exclude);
            }

            // remove short words
            contents = $scope.noShorts(contents, num);

            // remove accented chars
            contents = $scope.noAcc(contents);

            // remove punctuation
            contents = $scope.noPunct(contents);

            // remove double spaces
            contents = $scope.noDoubleSpaces(contents);

            // remove preposizioni, congiunzioni ecc.
            contents = $scope.grammatica(contents);

            // download del file con il testo di tutti i twyll
            $scope.download(contents, $rootScope.info.name.toString().replace(".json", "") + '-TWYLLS-FILTERED.txt', 'text/txt;charset=utf-8');
        };


        $scope.noTags = function (text) {
            var tag = /\B\@\w+/g;
            return text.replace(tag, " ");
        };

        $scope.noWords = function (text, words) {
            var ex = new RegExp("(" + words + ")", "gi");
            return text.replace(ex, " ");
        };

        $scope.noShorts = function (text, num) {
            var regString = "\\b(\\S){1," + num + "}\\b";
            var short_words = new RegExp(regString, "g");
            return text.replace(short_words, " ");
        };

        $scope.noAcc = function (text) {
            var acc = /\s[à-ý]|[À-Ý]/g;
            return text.replace(acc, " ");
        };

        $scope.noPunct = function (text) {
            var pun = /(~|`|’|!|$|%|^|&|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\\|\||-|_|=|“|”)/g;
            return text.replace(pun, " ");
        };

        $scope.noDoubleSpaces = function (text) {
            var spaces = /\s\s+/g ;
            return text.replace(spaces, ' ');
        };

        $scope.grammatica = function(testo) {

            var preposizioni_art = document.getElementById('preposizioni_art').value;
            var preposizioni_impr = document.getElementById('preposizioni_impr').value;
            var congiunzioni_coord = document.getElementById('congiunzioni_coord').value;
            var congiunzioni_sub = document.getElementById('congiunzioni_sub').value;


            if (preposizioni_art != ""){
                var preposizioni_art = $scope.string_to_array_multi(preposizioni_art);

                // exclude input words
                var word_exclude = "";
                for (var i = 0; i < preposizioni_art.length; i++) {
                    word_exclude = word_exclude.concat('\\s' + preposizioni_art[i] + '\\s' + "|");
                }
                var word_exclude = word_exclude.substring(0, word_exclude.length-1);
                var ex = new RegExp("(" + word_exclude + ")", "gi");
                testo = testo.replace(ex, " ");
            }

            if (preposizioni_impr != ""){
                var preposizioni_impr = $scope.string_to_array_multi(preposizioni_impr);

                // exclude input words
                var word_exclude = "";
                for (var i = 0; i < preposizioni_impr.length; i++) {
                    word_exclude = word_exclude.concat('\\s' + preposizioni_impr[i] + '\\s' + "|");
                }
                var word_exclude = word_exclude.substring(0, word_exclude.length-1);
                var ex = new RegExp("(" + word_exclude + ")", "gi");
                testo = testo.replace(ex, " ");
            }

            if (congiunzioni_coord != ""){
                var congiunzioni_coord = $scope.string_to_array_multi(congiunzioni_coord);

                // exclude input words
                var word_exclude = "";
                for (var i = 0; i < congiunzioni_coord.length; i++) {
                    word_exclude = word_exclude.concat('\\s' + congiunzioni_coord[i] + '\\s' + "|");
                }
                var word_exclude = word_exclude.substring(0, word_exclude.length-1);
                var ex = new RegExp("(" + word_exclude + ")", "gi");
                testo = testo.replace(ex, " ");
            }

            if (congiunzioni_sub != ""){
                var congiunzioni_sub = $scope.string_to_array_multi(congiunzioni_sub);

                // exclude input words
                var word_exclude = "";
                for (var i = 0; i < congiunzioni_sub.length; i++) {
                    word_exclude = word_exclude.concat('\\s' + congiunzioni_sub[i] + '\\s' + "|");
                }
                var word_exclude = word_exclude.substring(0, word_exclude.length-1);
                var ex = new RegExp("(" + word_exclude + ")", "gi");
                testo = testo.replace(ex, " ");
            }

            return testo;
        };

        $scope.string_to_array_multi = function(search) {
            search = search.toLowerCase();
            return search.split(", ");
        };


        $scope.dandelion = function() {

            var text = '';

            // scorro ogni riga del file dei twyll
            for (var i = 0; i < $rootScope.json.length; i++) {

                // se non è undefined entro nel capitolo
                if ($rootScope.json[i].comments != undefined) {

                    // conto i twyll originali per ogni paragrafo
                    if ($rootScope.json[i].comments.length != 0) {

                        for (var j = 0; j < $rootScope.json[i].comments.length; j++) {
                            text = $scope.htmlParser($rootScope.json[i].comments[j].content);

                            $scope.entityExtraction(text, i, j, -1);


                            //$scope.sentimentAnalysis(text, i, j, -1);
                            // $scope.textClassification(text, i, j, -1);

                            // se ci sono, conto i twyll di risposta
                            if ($rootScope.json[i].comments[j].answers != undefined) {

                                for (var k = 0; k < $rootScope.json[i].comments[j].answers.length; k++) {
                                    text = $scope.htmlParser($rootScope.json[i].comments[j].answers[k].content);

                                    $scope.entityExtraction(text, i, j, k);

                                    //$scope.sentimentAnalysis(text, i, j, k);
                                    // $scope.textClassification(text, i, j, k);

                                }
                            }
                        }
                    }
                }

            }






            //$scope.download( JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DANDELION.json', 'application/json;charset=utf-8');

        };

        $scope.downloadDandelion = function(){
            if(($scope.dandelioneu.total) == $scope.analytics.comments + $scope.analytics.answers) {
                $scope.download(JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DANDELION.json', 'application/json;charset=utf-8');
            }
        };

        $scope.downloadDandelionEU = function(){
            $scope.download(JSON.stringify($rootScope.json), $rootScope.info.name.toString().replace(".json", "") + '-DANDELION.json', 'application/json;charset=utf-8');
        };





        $scope.entityExtraction = function(content, i, j, k) {
            var lang = '';
            lang = 'lang=' + 'it' + '%20&';
            //var specials = /(#)/g;
            //content.replace(specials, "");
            var text = encodeURIComponent(content) + '&';
            var token = '0f3ed3f05bc44027bb28c2765a2b8442';
            var url = "https://api.dandelion.eu/datatxt/nex/v1/?" + lang + "text=" + text + "include=types%2Cabstract%2Ccategories%2Clod&" + "token=" + token;

            var settings = {
                "async": true,
                "crossDomain": true,
                "url": url,
                "method": "POST",
                "dataType": "jsonp",
                "data": {
                    "parameter": token
                },
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                success: function(response) {
                    console.log(response)


                    $scope.$apply(function() {
                        $scope.dandelioneu.entity++;
                        $scope.dandelioneu.total = $scope.dandelioneu.entity + $scope.dandelioneu.sentiment + $scope.dandelioneu.classification;
                    });

                    if (k == -1){
                        $rootScope.json[i].comments[j].entityExtraction = response;
                        $scope.downloadDandelion();
                    }
                    else {
                        $rootScope.json[i].comments[j].answers[k].entityExtraction = response;
                        $scope.downloadDandelion();
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            };


            $.ajax(settings).done(function (response) {
            });


        };

        $scope.sentimentAnalysis = function(content, i, j, k) {
            var lang = '';
            lang = 'lang=' + 'it' + '%20&';
            var text = encodeURI(content) + '&';
            var token = '0f3ed3f05bc44027bb28c2765a2b8442';
            var url = "https://api.dandelion.eu/datatxt/sent/v1/?" + lang + "text=" + text + "token=" + token;

            var settings = {
                "async": false,
                "crossDomain": true,
                "url": url,
                "method": "GET",
                "headers": {}
            };

            $.ajax(settings).done(function (response) {
                if (k == -1){
                    $rootScope.json[i].comments[j].sentimentAnalysis = response;
                    //console.log($rootScope.json[i].comments[j]);
                }
                else {
                    $rootScope.json[i].comments[j].answers[k].sentimentAnalysis = response;
                    //console.log($rootScope.json[i].comments[j].answers[k]);
                }
            });
        };

        $scope.textClassification = function(content, i, j, k) {
            var lang = '';
            // lang = 'lang=' + 'it' + '%20&';
            var text = encodeURI(content) + '&';
            var model = "news_eng";
            var token = '0f3ed3f05bc44027bb28c2765a2b8442';
            var url = "https://api.dandelion.eu/datatxt/cl/v1/?" + lang + "text=" + text + "&model="+ model + "&min_score=0.2&include=score_details&" + "token=" + token;

            var settings = {
                "async": false,
                "crossDomain": true,
                "url": url,
                "method": "GET",
                "headers": {}
            };

            $.ajax(settings).done(function (response) {
                if (k == -1){
                    $rootScope.json[i].comments[j].textClassification = response;
                    //console.log($rootScope.json[i].comments[j]);
                }
                else {
                    $rootScope.json[i].comments[j].answers[k].textClassification = response;
                    //console.log($rootScope.json[i].comments[j].answers[k]);
                }


            });
        };



    }])




    .filter('trusted', function ($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })




/*
ADD SINGLE JSON, ABANDONED
 */
/*
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
*/