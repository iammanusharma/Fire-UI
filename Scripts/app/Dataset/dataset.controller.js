(function () {

    var FireControllers = angular.module('FireControllers', []);

    FireControllers.controller("DatasetController", ['$scope', 'DatasetService','$routeParams',
        function ($scope, DatasetService, $routeParams) {

        $scope.datasets = [];
        $scope.datasets.push({ "id": 1, "version": 0, "name": "Cars", "description": "Cars Dataset", "path": "/home/user/cars.csv", "delimiter": null,
            "Schema": [{ "name": "c1", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }, { "name": "c2", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }]
        });
        
        $scope.datasets.push({"id": 2, "version": 0, "name": "Housing", "description": "House Dataset", "path": "/home/user/house.json", "delimiter": null,
            "Schema": [{ "name": "c2", "type": "text", "MLType": "1", "first": "text one", "second": "text two" }]});

       
         
        }]);

    FireControllers.controller("DatasetViewController", ['$scope', 'DatasetService','$routeParams',

    function ($scope, DatasetService,$routeParams) {

           $scope.datasets = [];
           $scope.selectedDataset = {};
           $scope.selectedid = $routeParams.id;
           if ($routeParams.isedit == 'view') { $scope.isEdit = false; }
           else { $scope.isEdit = true;}
           $scope.selectedDataset = {
               "id": 1, "version": 0, "name": "Cars", "description": "Cars Dataset", "path": "/home/user/cars.csv", "delimiter": null,
               "schema": [{ "name": "c1", "type": "string", "MLType": "1", "first": "text one", "second": "text two" }, { "name": "c2", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }]
           };
       }]);

}());


