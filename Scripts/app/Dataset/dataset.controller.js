(function () {

    var FireControllers = angular.module('FireControllers', []);

    FireControllers.controller("DatasetController", ['$scope', 'DatasetService','$routeParams',
        function ($scope, DatasetService, $routeParams) {

        $scope.datasets = [];
        $scope.datasets.push({ "id": 1, "version": 0, "name": "Cars", "description": "Cars Dataset", "path": "/home/user/cars.csv", "delimiter": null,
            "Schema": [{ "name": "c1", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }, { "name": "c2", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }]
        });
        
        $scope.datasets.push({"id": 2, "version": 0, "name": "Housing", "description": "House Dataset", "path": "/home/user/house.json", "delimiter": null,
            "Schema": [{ "name": "c2", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }]});


        //$scope.schemaColumns.push({ "name": "c1", "type": "int", "MLType": "0", "first": "text one", "second": "text two" });

        //$scope.schemaColumns.push({ "name": "c2", "type": "int", "MLType": "0", "first": "text a one", "second": "text a two" });
        //$scope.schemaColumns.push({ "name": "c3", "type": "sting", "MLType": "1", "first": "text b one", "second": "text b two" });
        //$scope.schemaColumns.push({ "name": "c4", "type": "int", "MLType": "2", "first": "text c one", "second": "text c two" });
        //$scope.schemaColumns.push({ "name": "c5", "type": "int", "MLType": "0", "first": "text d one", "second": "text d two" });


        //var z = DatasetService.getNodes().then(function (result) {
        //    $scope.nodeList = result;
        //    $scope.nodeList = [];
        //    //$scope.nodeList.push([{ "id": "KMCSVeans", "type": null, "fields": [{ "name": "csv.directory", "value": "" }, { "name": "csv.delimiter", "value": "" }], "class_": "fire.nodes.dataset.NodeDatasetFileOrDirectoryCSV" }, { "id": "KMeans", "type": null, "fields": [{ "name": "kmeans.num_clusters", "value": "" }, { "name": "kmeans.max_iter", "value": "" }], "class_": "fire.nodes.ml.NodeKMeans" }]);
        //    $scope.nodeList.push({ "id": "csv", "fields": [{ "name": "csv.directory", "value": "","type":"textbox" }, { "name": "csv.delimiter", "value": "" ,"type":"textbox"}] });
        //    $scope.nodeList.push({ "id": "Kmeans", "fields": [{ "name": "Kmeans textbox1", "value": "123", "type": "textbox" }, { "name": "textbox 2", "value": "", "type": "textbox" }] });
        //    $scope.library_topleft = angular.copy($scope.library_topleftNodes);
		//	angular.forEach($scope.nodeList, function(node) {
		//		  $scope.addModuleToLibrary(node.id, node.fields,
        //                $scope.library_topleft.x + $scope.library_topleft.margin,
        //                $scope.library_topleft.y + $scope.library_topleft.margin + $scope.library_topleft.item_height);
		//		  $scope.library_topleft.item_height = $scope.library_topleft.item_height + 50;
		//		});
        //});

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
               "schema": [{ "name": "c1", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }, { "name": "c2", "type": "int", "MLType": "0", "first": "text one", "second": "text two" }]
           };
       }]);

}());


