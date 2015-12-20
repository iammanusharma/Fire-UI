(function () {


    var FireService = function ($http, $q) {

        var getNodes = function () {
            var deferred = $q.defer();

            $http.get('http://localhost:8080/nodeList')
                .then(function (result) {
                    //success
                    deferred.resolve(result.data);
                },
                function (error) {
                    //error
                    deferred.resolve();
                });

            return deferred.promise;
        };
        var saveWorkflow = function (workflow) {
            var deferred = $q.defer();

            $http({
                url: 'http://localhost:8080/save',
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                'data': JSON.stringify(workflow),
                'dataType': 'json',
            })
            .then(function (result) {
                //success
                deferred.resolve(result.data);
            },
            function (error) {
                //error

                deferred.resolve();
            });

            return deferred.promise;
        };

        return {
            getNodes: getNodes,
            saveWorkflow: saveWorkflow
        };

    };


    var module = angular.module("FireApp");
    module.factory("FireService", FireService);
    FireService.$inject = ["$http", "$q"];


}());