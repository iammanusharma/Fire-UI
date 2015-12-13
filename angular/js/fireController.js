(function () {

    var myApp = angular.module('FireApp', [ 'ui.bootstrap']);

    var FireController = function ($scope, $interval, $location, FireService, $uibModal) {

        //controllers manage an object $scope in AngularJS (this is the view model)
        //myApp.controller('FireController', function ($scope) {
        $scope.edges = [];
        var z = FireService.getNodes().then(function (result) {
            $scope.nodeList = result;
            $scope.nodeList = [];
            //$scope.nodeList.push([{ "id": "KMCSVeans", "type": null, "fields": [{ "name": "csv.directory", "value": "" }, { "name": "csv.delimiter", "value": "" }], "class_": "fire.nodes.dataset.NodeDatasetFileOrDirectoryCSV" }, { "id": "KMeans", "type": null, "fields": [{ "name": "kmeans.num_clusters", "value": "" }, { "name": "kmeans.max_iter", "value": "" }], "class_": "fire.nodes.ml.NodeKMeans" }]);
            $scope.nodeList.push({ "id": "csv", "fields": [{ "name": "csv.directory", "value": "","type":"textbox" }, { "name": "csv.delimiter", "value": "" ,"type":"textbox"}] });
            $scope.nodeList.push({ "id": "Kmeans", "fields": [{ "name": "Kmeans textbox1", "value": "123", "type": "textbox" }, { "name": "textbox 2", "value": "", "type": "textbox" }] });
            $scope.library_topleft = angular.copy($scope.library_topleftNodes);
			angular.forEach($scope.nodeList, function(node) {
				  $scope.addModuleToLibrary(node.id, node.fields,
                        $scope.library_topleft.x + $scope.library_topleft.margin,
                        $scope.library_topleft.y + $scope.library_topleft.margin + $scope.library_topleft.item_height);
				  $scope.library_topleft.item_height = $scope.library_topleft.item_height + 50;
				});
        });
         
            // define a module with library id, schema id, etc.
            function module(library_id, schema_id, title, fields, x, y) {
                this.library_id = library_id;
                this.schema_id = schema_id;
                this.title = title;
                this.fields = fields;
                this.x = x;
                this.y = y;
            }

            // module should be visualized by title, icon
            $scope.library = [];

            // library_uuid is a unique identifier per module type in the library
            $scope.library_uuid = 0;

            // state is [identifier, x position, y position, title, description]
            $scope.schema = [];

            // schema_uuid should always yield a unique identifier, can never be decreased
            $scope.schema_uuid = 0;

            // todo: find out how to go back and forth between css and angular
            $scope.library_topleftNodes = {
                x: 15,
                y: 145,
                item_height: 0,
                margin: 5,
            };

            $scope.library_topleft = $scope.library_topleftNodes;


            $scope.module_css = {
                width: 150,
                height: 100, // actually variable
            };

            $scope.redraw = function () {
                $scope.schema_uuid = 0;
                jsPlumb.detachEveryConnection();
                $scope.schema = [];
                $scope.library = [];
                $scope.library_topleft = angular.copy($scope.library_topleftNodes);
				angular.forEach($scope.nodeList, function(node) {
				  $scope.addModuleToLibrary(node.id, node.fields,
                        $scope.library_topleft.x + $scope.library_topleft.margin,
                        $scope.library_topleft.y + $scope.library_topleft.margin + $scope.library_topleft.item_height);
				  $scope.library_topleft.item_height = $scope.library_topleft.item_height + 50;
				});

           };

            // add a module to the library
            $scope.addModuleToLibrary = function (title, fields, posX, posY) {
                console.log("Add module " + title + " to library, at position " + posX + "," + posY);
                var library_id = $scope.library_uuid++;
                var schema_id = -1;
                var m = new module(library_id, schema_id, title, fields, posX, posY);
                $scope.library.push(m);
            };

            // add a module to the schema
            $scope.addModuleToSchema = function (library_id, posX, posY) {
                console.log("Add module " + title + " to schema, at position " + posX + "," + posY);
                var schema_id = $scope.schema_uuid++;
                var title = "Unknown";
                var fields =[];
                for (var i = 0; i < $scope.library.length; i++) {
                    if ($scope.library[i].library_id == library_id) {
                        title = $scope.library[i].title;
                        fields = $scope.library[i].fields;
                    }
                }
                var m = new module(library_id, schema_id, title, fields, posX, posY);
                $scope.schema.push(m);
				console.log('schema'+$scope.schema);
            };

            $scope.saveWorkflow = function () {
                $scope.workflow = [];
                $scope.workflow.push($scope.schema);
                $scope.workflow.push($scope.edges);
                FireService.saveWorkflow($scope.workflow).then(function (result) {
                    alert("success");
                });			
			};

            $scope.removeState = function (schema_id) {
                console.log("Remove state " + schema_id + " in array of length " + $scope.schema.length);
                for (var i = 0; i < $scope.schema.length; i++) {
                    // compare in non-strict manner
                    if ($scope.schema[i].schema_id == schema_id) {
                        console.log("Remove state at position " + i);
                        $scope.schema.splice(i, 1);
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
            $scope.editSchema = function (id) {

                $scope.modelNode = [];
                for (var i = 0; i < $scope.schema.length; i++) {
                    if ($scope.schema[i].title == id) {
                        $scope.modelNode.title = id;
                        $scope.modelNode.fields = $scope.schema[i].fields;
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
                    //Call method to edit schema from the parent controller.
                    scope.$parent.editSchema(this.id);
                });

            }
        };
    });

    //
    // This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
    // painted again on its original position, and the full module should be displayed on the dragged to location.
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

                        // if dragged item has class menu-item and dropped div has class drop-container, add module 
                        if (dragEl.hasClass('menu-item') && dropEl.hasClass('drop-container')) {
                            console.log("Drag event on " + dragIndex);
                            var x = event.pageX - scope.module_css.width / 2;
                            var y = event.pageY - scope.module_css.height / 2;

                            scope.addModuleToSchema(dragIndex, x, y);
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


