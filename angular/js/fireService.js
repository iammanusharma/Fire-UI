(function () {

     
        var FireService = function ($http,$q) {
             
            var getUser = function (username) {
                var deferred = $q.defer();

                $http.get("https://api.github.com/users/" + username)
                    .then(function (result) {
                        //success
                        deferred.resolve(result.data);
                    },
                    function (error) {
                        //error
                        deferred.reject();
                    });

                return deferred.promise;
            };

            return {
                getUser: getUser,
            };

        };

        
        var module = angular.module("FireApp");
        module.factory("FireService", FireService);
        FireService.$inject = ["$http", "$q"];
    

}());