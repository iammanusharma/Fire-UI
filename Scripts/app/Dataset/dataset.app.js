
(function () {
   
    var FireApp = angular.module('FireApp', ['ngRoute','FireControllers','FireAppService']);
   // angular.module('FireApp', ['ngRoute', 'FireControllers', 'DatasetViewController'])
    FireApp.config(['$routeProvider', '$locationProvider', function ($routeProvider) {
            $routeProvider
                   .when('/dataset',
                   {
                       templateUrl: '/Templates/_dataset.tmpl.html', controller: 'DatasetController'
                   })
                   .when('/datasetView/:id/:isedit', {
                       templateUrl: '/Templates/_datasetView.tmpl.html', controller: 'DatasetViewController'
                   })
                   .otherwise({ redirectTo: '/dataset' });

            //$locationProvider.html5Mode(false);
        }]);
}());