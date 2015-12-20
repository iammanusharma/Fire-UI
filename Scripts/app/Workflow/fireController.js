(function () {

    var myApp = angular.module('FireApp', [ 'ui.bootstrap']);

    var FireController = function ($scope, $interval, $location, FireService, $uibModal) {

        //controllers manage an object $scope in AngularJS (this is the view model)
        //myApp.controller('FireController', function ($scope) {
        $scope.edges = [];
        var z = FireService.getNodes().then(function (result) {
            $scope.nodeList = [];
           // $scope.selectedPredictorVariables = "";
            //$scope.nodeList.push([{ "id": "KMCSVeans", "type": null, "fields": [{ "name": "csv.directory", "value": "" }, { "name": "csv.delimiter", "value": "" }], "class_": "fire.nodes.dataset.NodeDatasetFileOrDirectoryCSV" }, { "id": "KMeans", "type": null, "fields": [{ "name": "kmeans.num_clusters", "value": "" }, { "name": "kmeans.max_iter", "value": "" }], "class_": "fire.nodes.ml.NodeKMeans" }]);
            $scope.nodeList.push({
                "id": "CSV",
                "type": "dataset",
                "nodeClass": "fire.nodes.dataset.NodeDatasetFileOrDirectoryCSV",
                "fields": [
                  { "name": "csv.dataset", "value": "", "widget": "dataset", "title": "Dataset" }
                ]
            });
            $scope.nodeList.push({
                "id": "KMeans",
                "type": "ml",
                "nodeClass": "fire.nodes.ml.NodeKMeans",
                "fields": [
                  { "name": "kmeans.num_clusters", "value": "", "widget": "textfield", "title": "Num Clusters" },
                  { "name": "kmeans.max_iter", "value": "", "widget": "textfield", "title": "Max Iter" },

                  {
                      "name": "kmeans.predictorVariable", "value": ["PV1", "PV2", "PV3"], "widget": "variable", "title": "Target Variable"
                 , "selectedValues": []
                  },
                  {
                      "name": "kmeans.predictorvariables", "value": ["col1", "col2", "col3"], "widget": "variables", "title": "Predictor Variables"
                 , "selectedValues": []
                  }
                ]
            });

            $scope.library_topleft = angular.copy($scope.library_topleftNodes);
            angular.forEach($scope.nodeList, function(node) {
                $scope.addNodeToLibrary(node.id,node.type, node.nodeClass,node.fields,
                      $scope.library_topleft.x + $scope.library_topleft.margin,
                      $scope.library_topleft.y + $scope.library_topleft.margin + $scope.library_topleft.item_height);
                $scope.library_topleft.item_height = $scope.library_topleft.item_height + 50;
            });
        });

        // define a node with library id, module id, etc.
        function node(library_id, module_id,id, type, nodeClass,fields, x, y) {
            this.library_id = library_id;
            this.module_id = module_id;
            this.id = id;
            this.type = type;
            this.nodeClass = nodeClass;
            this.fields = fields;
            this.x = x;
            this.y = y;
        }

        // node should be visualized by title, icon
        $scope.library = [];

        // library_uuid is a unique identifier per node type in the library
        $scope.library_uuid = 0;

        // state is [identifier, x position, y position, title, description]
        $scope.module = [];

        // module_uuid should always yield a unique identifier, can never be decreased
        $scope.module_uuid = 0;

        // todo: find out how to go back and forth between css and angular
        $scope.library_topleftNodes = {
            x: 15,
            y: 195,
            item_height: 0,
            margin: 5,
        };

        $scope.library_topleft = $scope.library_topleftNodes;


        $scope.node_css = {
            width: 200,
            height: 120, // actually variable
        };

        $scope.redraw = function () {
            $scope.module_uuid = 0;
            jsPlumb.detachEveryConnection();
            $scope.module = [];
            $scope.library = [];
            $scope.library_topleft = angular.copy($scope.library_topleftNodes);
            angular.forEach($scope.nodeList, function(node) {
                $scope.addNodeToLibrary(node.id, node.type, node.nodeClass,node.fields,
                      $scope.library_topleft.x + $scope.library_topleft.margin,
                      $scope.library_topleft.y + $scope.library_topleft.margin + $scope.library_topleft.item_height);
                $scope.library_topleft.item_height = $scope.library_topleft.item_height + 50;
            });

        };

        // add a node to the library
        $scope.addNodeToLibrary = function (id, type, nodeClass,fields, posX, posY) {
            console.log("Add node " + id + " to library, at position " + posX + "," + posY);
            var library_id = $scope.library_uuid++;
            var module_id = -1;
            var m = new node(library_id, module_id, id, type, nodeClass,fields, posX, posY);
            $scope.library.push(m);
        };

        // add a node to the module
        $scope.addNodeToModule = function (library_id, posX, posY) {
            console.log("Add node " + type + " to module, at position " + posX + "," + posY);
            var module_id = $scope.module_uuid++;
            var type = "Unknown";
            var nodeClass = "Likewise unknown";
            var fields =[];
            for (var i = 0; i < $scope.library.length; i++) {
                if ($scope.library[i].library_id == library_id) {
                    id = $scope.library[i].id;
                    type = $scope.library[i].type;
                    nodeClass = $scope.library[i].nodeClass;
                    fields = $scope.library[i].fields;
                }
            }
            var m = new node(library_id, module_id, id, type, nodeClass,fields, posX, posY);
            $scope.module.push(m);
            console.log('module'+$scope.module);
        };

        $scope.saveWorkflow = function () {
            $scope.workflow ;
            var nodes=[];
            var edges=[];
            var fields=[];
            for (var i = 0; i < $scope.module.length; i++) {

                for (var j = 0; j < $scope.module[i].fields.length; j++){
                    fields.push({
                        "name":$scope.module[i].fields[j].name,
                        "value": $scope.module[i].fields[j].value,
                        "selectedValues":$scope.module[i].fields[j].selectedValues,
                        "widget":$scope.module[i].fields[j].widget,
                        "title":$scope.module[i].fields[j].title
                    })
                }
                nodes.push({
                    "id":$scope.module[i].id,
                    "type":$scope.module[i].type,
                    "nodeClass":$scope.module[i].nodeClass,
                    "fields":fields
                })
            }
            for (var i = 0; i < $scope.edges.length; i++) {
                edges.push({
                    "source":$scope.edges[i].source,
                    "target":$scope.edges[i].target,

                })
            }
            $scope.workflow = (
                {
                    "name":$scope.workflowname,
                    "nodes":nodes,
                    "edges":edges
                })
            // $scope.workflow.edges=$scope.edges;
            console.log($scope.workflow);
            FireService.saveWorkflow($scope.workflow).then(function (result) {
                alert("success");
            });
        };

        $scope.removeState = function (module_id) {
            console.log("Remove state " + module_id + " in array of length " + $scope.module.length);
            for (var i = 0; i < $scope.module.length; i++) {
                // compare in non-strict manner
                if ($scope.module[i].module_id == module_id) {
                    console.log("Remove state at position " + i);
                    $scope.module.splice(i, 1);
                }
            }
        };

        $scope.init = function () {
            jsPlumb.bind("ready", function () {
                console.log("Set up jsPlumb listeners (should be only done once)");
                jsPlumb.bind("connection", function (info) {
                    $scope.$apply(function () {
                        $scope.edges.push({ "source": info.sourceId,"target":info.targetId });
                        console.log("Possibility to push connection into array");
                    });
                });
            });
        }


        //Modal Popup Start
        $scope.animationsEnabled = true;
        $scope.editModule = function (id) {

            $scope.modelNode = [];
            for (var i = 0; i < $scope.module.length; i++) {
                if ($scope.module[i].module_id == id) {
                    $scope.modelNode.name = $scope.module[i].id;
                    $scope.modelNode.fields = $scope.module[i].fields;
                }
            }

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'sm'
                ,
                resolve: {
                    items: function () {
                        return $scope.modelNode;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

        //Modal Popup END

    };

    //Modal Popup helper
    myApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

        $scope.modelNode = items;
        //$scope.selected = {
        //    item: $scope.items[0]
        //};

        $scope.ok = function () {
            $uibModalInstance.close($scope.modelNode);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    myApp.controller("FireController", FireController);

    myApp.directive('postRender', ['$timeout', function ($timeout) {
        var def = {
            restrict: 'A',
            terminal: true,
            transclude: true,
            link: function (scope, element, attrs) {
                $timeout(scope.redraw, 0);  //Calling a scoped method
            }
        };
        return def;
    }]);

    //directives link user interactions with $scope behaviours
    //now we extend html with <div plumb-item>, we can define a template <> to replace it with "proper" html, or we can 
    //replace it with something more sophisticated, e.g. setting jsPlumb arguments and attach it to a double-click 
    //event
    myApp.directive('plumbItem', function () {
        return {
            replace: true,
            controller: 'FireController',
            link: function (scope, element, attrs) {
                console.log("Add plumbing for the 'item' element");

                jsPlumb.makeTarget(element, {
                    anchor: 'Continuous',
                    maxConnections: 2,
                    endpoint:["Dot", {radius: 1}],
                });
                jsPlumb.draggable(element, {
                    containment: 'parent'
                });

                // this should actually done by a AngularJS template and subsequently a controller attached to the dbl-click event
                element.bind('dblclick', function (e) {
                    //Call method to edit module from the parent controller.
                    scope.$parent.editModule(this.id);
                    /*     jsPlumb.detachAllConnections($(this));
                         $(this).remove();
                         // stop event propagation, so it does not directly generate a new state
                         e.stopPropagation();
                         //we need the scope of the parent, here assuming <plumb-item> is part of the <plumbApp>
                         scope.$parent.removeState(attrs.identifier);
                         scope.$parent.$digest();*/
                });

            }
        };
    });

    //
    // This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
    // painted again on its original position, and the full node should be displayed on the dragged to location.
    //
    myApp.directive('plumbMenuItem', function () {
        return {
            replace: true,
            controller: 'FireController',
            link: function (scope, element, attrs) {
                console.log("Add plumbing for the 'menu-item' element");

                // jsPlumb uses the containment from the underlying library, in our case that is jQuery.
                jsPlumb.draggable(element, {
                    containment: element.parent().parent()
                });
            }
        };
    });

    myApp.directive('plumbConnect', function () {
        return {
            replace: true,
            link: function (scope, element, attrs) {
                console.log("Add plumbing for the 'connect' element");

                jsPlumb.makeSource(element, {
                    parent: $(element).parent(),
                    anchor: 'Continuous',
                    paintStyle: {
                        strokeStyle: "#1e8151", lineWidth: 1,
                        strokeWidth: 3
                    },
                    endpoint:["Dot", {radius: 1}],

                    connectorOverlays: [
                        [ "Arrow", {
                            location: 1,
                            id: "arrow",
                            length: 14,
                            foldback: 0.8
                        } ]
                    ]

                });
            }
        };
    });

    myApp.directive('droppable', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                console.log("Make this element droppable");

                element.droppable({
                    drop: function (event, ui) {
                        // angular uses angular.element to get jQuery element, subsequently data() of jQuery is used to get
                        // the data-identifier attribute
                        var dragIndex = angular.element(ui.draggable).data('identifier'),
                            dragEl = angular.element(ui.draggable),
                            dropEl = angular.element(this);

                        // if dragged item has class menu-item and dropped div has class drop-container, add node
                        if (dragEl.hasClass('menu-item') && dropEl.hasClass('drop-container')) {
                            console.log("Drag event on " + dragIndex);
                            var x = event.pageX - scope.node_css.width / 2;
                            var y = event.pageY - scope.node_css.height / 2;

                            scope.addNodeToModule(dragIndex, x, y);
                        }

                        scope.$apply();
                    }
                });
            }
        };
    });

    myApp.directive('draggable', function () {
        return {
            // A = attribute, E = Element, C = Class and M = HTML Comment
            restrict: 'A',
            //The link function is responsible for registering DOM listeners as well as updating the DOM.
            link: function (scope, element, attrs) {
                console.log("Let draggable item snap back to previous position");
                element.draggable({
                    // let it go back to its original position
                    revert: true,
                });
            }
        };
    });

}());



          