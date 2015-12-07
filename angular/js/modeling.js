$(function() {

  $("#modeling-menu-item").addClass("active");


  // Validation

  $.validator.messages.required = messages.missingrequiredfields;

  var validator = $("#modeling-edit-form").validate({
    rules: {
      name: {
        required: true
      },
      target: {
        required: true
      }
    },
    errorLabelContainer: "#validation-errors",
    groups: {
      required_fields: "name target"
    }
  });

 // Workflow Table

  $.fn.DataTable.ext.pager.numbers_length = 4;

  var modelingTable = $('#modeling-table').dataTable({
    "bLengthChange": false,
    "iDisplayLength": 10,
    "fnDrawCallback": function( oSettings ) {

      $('#modeling-table_filter input').appendTo('#searchspace');
      $('#searchspace input').attr('placeholder', 'Search for workflow');
      $('#searchspace input').addClass('form-control');
      $('#searchspace input').addClass('input-large');
      $('#modeling-table_wrapper > .row:first-child').hide();
    },
    aoColumnDefs: [ {
     bSortable: false,
     aImports: [ -1 ]
    }],
    "oLanguage": {
      "sZeroRecords":  "No matching workflows found",
      "sInfo":         "Showing _START_ to _END_ of _TOTAL_ workflows",
      "sInfoEmpty":    "Showing 0 to 0 of 0  workflows",
      "sInfoFiltered": "(filtered from _MAX_ total workflows)",
    }
  });



  // populate the table

  populateTable();

  // Show all modeling workflows

  function populateTable() {

    $.get('findmodelingworkflows.html', function(response) {

      $.each(response.data, function(index, row){

        addRow(row);
      });
    })
    .error(function(xhr, ajaxOptions, thrownError) {

    });
  }

  // Add a new row
  function addRow(data) {

    var status = "";
    var lastDate = "";
    var jobId = "";

    if (data.lastStatusHistory) {
      status = data.lastStatusHistory.status;
      jobId = data.lastStatusHistory.jobId;
      lastDate = (new Date(data.lastStatusHistory.endTime)).toLocaleString();
    }
    
    var oTable = $('#modeling-table').dataTable();

    oTable.fnAddData({
      "0": data.name,
      "1": data.target.name,
      "2": (new Date(data.createdDate)).toLocaleString(),
      "3": (new Date(data.modifiedDate)).toLocaleString(),
      "4" : getWorkflowJobStatusSpan(data.id, status, jobId),
      "5": buildWorkflowActions({id : data.id, name : data.name}, status, jobId)
    });
  }

  function updateRunningRowsStatusAndActions(jobs) {
    
    $.each(jobs, function(index, value) {
      
      var row = $("span[jobid=" + value.id + "]").closest("tr").get(0);
      var workflowId = $("span[jobid=" + value.id + "]").attr('jobmodelid');

      var jobId = value.id;
      var status = value.status;
      var lastTime = new Date(value.endTime);
 
      if (status === "RUNNING")
        lastTime = new Date(value.startTime);
      
      updateRowStatusAndActions(row, status, jobId, workflowId, lastTime);
      
    });
  }
  
  function getWorkflowJobStatusSpan(id, status, jobId) {
    var labelClass = "label-default";
    
    if (!status)
      status = "";
    
    if (status === "SUCCEEDED")
      labelClass = "label-success";
    else if (status === "KILLED")
      labelClass = "label-danger";
    else if (status === "FAILED")
      labelClass = "label-danger";
    else if ((status === "RUNNING") || (status === "SUSPENDED"))
      labelClass = "label-warning";
    
    return "<span jobmodelid = '" + id + "' jobid = '" + jobId + "' job-status = '" + status + "' class='" + "label label-status " + labelClass + "'>" + status + "</span>";
    
  }
  

  // Save Workflow
  $("#save-workflow-btn").click(function(e) {

    e.preventDefault();
    saveWorkflow();
  });



  // Execute Workflow
  $("#execute-workflow-btn").click(function(e) {

    e.preventDefault();

  });



  // Cancel modeling edit
  $("#cancel-edit-btn").click(function(e) {

    e.preventDefault();

    validator.resetForm();
    $("#modeling-edit").hide();
    $("#modeling-list").show();
  });


  // Edit Workflow
  $("body").on("click", ".editworkflow", function(e) {

    e.preventDefault();

    var id = $(this).attr("workflowid");
    showEdit(id);
  });


  // Delete Workflow
  $("body").on("click", ".delworkflow", function(e) {

    e.preventDefault();

    var id = $(this).attr("workflowid");
    var name = $(this).attr("workflowname");
    var row = $(this).closest("tr").get(0);
    deleteWorkflow(id, name, row);
  });

  // New Workflow
  $(".newworkflow").on("click", function(e) {

    e.preventDefault();
    showEdit(0);
  });


  // Update a row
  function updateRow(data) {

    var oTable = $('#modeling-table').dataTable();

    var row = $("#row-edit-" + data.id).closest("tr").get(0);
    
    var status = "";
    var lastDate = "";
    var jobId = "";

    if (data.lastStatusHistory) {

      status = data.lastStatusHistory.status;
      jobId = data.lastStatusHistory.jobId;
      lastDate = (new Date(data.lastStatusHistory.endTime)).toLocaleString();
    }
    
    oTable.fnUpdate({
      "0": data.name,
      "1": data.target.name,
      "2": (new Date(data.createdDate)).toLocaleString(),
      "3": (new Date(data.modifiedDate)).toLocaleString(),
      "4" : getWorkflowJobStatusSpan(data.id, status, jobId),
      "5": buildWorkflowActions(data, status, jobId)
    }, oTable.fnGetPosition(row));
  }

  // Build Actions

  function buildWorkflowActions(data, jobStatus, lastJobId) {


    var status = "";
    var jobId = "";

    if (jobStatus) {
      status = jobStatus;
      jobId = lastJobId;
    }
    var runAction = '<a style = "color:white;" href="#" ' + '" workflowid=' + data.id +
        ' action = "runworkflow" class="btn btn-primary btn-sm" title="Run"><i class="fa fa-play"></i></a> ';
    var resumeAction = '<a style = "color:white;" href="#" ' + '" workflowid=' + data.id +
    ' action = "resumeworkflow" jobid = "' + jobId + '" class="btn btn-primary btn-sm" title="Resume"><i class="fa fa-play"></i></a> ';
    var suspendAction = '<a style = "color:white;" href="#" ' + '" workflowid=' + data.id +
    ' action = "suspendworkflow" jobid = "' + jobId + '" class="btn btn-primary btn-sm" title="Suspend"><i class="fa fa-pause"></i></a> ';
    var killAction = '<a style = "color:white;" href="#" ' + '" workflowid=' + data.id +
    ' action = "killworkflow" jobid = "' + jobId + '" class="btn btn-primary btn-sm" title="Kill"><i class="fa fa-stop"></i></a> ';
    
    if (status === "RUNNING")
      runAction = suspendAction + killAction;
    else if (status === "SUSPENDED")
      runAction = resumeAction + killAction;
    
    var actions =
      '<div class="actions">' +
       runAction +
      '<a href="#" style = "color:white;" id="row-edit-' + data.id  + '" workflowid=' + data.id + 
          ' class="editworkflow btn btn-primary btn-sm" title="Edit"><i class="fa fa-pencil"></i></a>' +
        ' <a href="#" style = "color:white;" id="row-del-' + data.id  + '" workflowid=' + data.id + ' workflowname=' + data.name + 
          ' class="delworkflow btn btn-primary btn-sm" title="Delete"><i class="fa fa-trash-o"></i></a>' +
      '</div>';

    return actions;
    
  }



  // Delete Workflow
  function deleteWorkflow(id, name, row) {

   
   if (!id) {

      showAlert(messages.selectrowtodelete);
      return;
    }

    var oTable = $('#modeling-table').dataTable();

    // Confirm and delete
    showConfirm('<h4>Confirm Deletion</h4><p>Are you sure you want to delete workflow : ' + name + '?</p>',
      function() {
      spin(".st-container", true);
        $.ajax({
  
          processData : false,
          async : true,
          cache: true,
          url : "modeling/" + id,
          type : "DELETE",
          success : function(response) {
            spin(".st-container", false);
            oTable.fnDeleteRow( oTable.fnGetPosition(row) );
            showSuccessMessage("Workflow Deleted", "Workflow has been deleted.");
          },
          error : function(xhr, status, thrownError) {
            spin(".st-container", false);
            if ((xhr.responseJSON) && (xhr.responseJSON[0].message))
              thrownError = xhr.responseJSON[0].message;
            switch(xhr.status) {
            case 404:
              showErrorMessage("Workflow Deletion", messages.servererror + '<br/><br/>' + thrownError);
            }
          },
          complete : function(xhr, status) {
            spin(".st-container", false);
          }
      });
      

    });
    
  }


  // Get modeling workflow information
  function findWorkflow(id) {

    var workflow = null;

    $.ajax({
      contentType : "application/json",
      processData : true,
      data : {id : id},
      async : false,
      url : "findmodelingworkflow.html",
      type : "GET",
      success : function(response) {

        if (response.status != 0)
          workflow = response.data;
      },
      error : function(request, status, thrownError) {

      }
    });

    return workflow;
  }

  // Show edit area
  function showEdit(id) {

    // Clear any previous errors

    validator.resetForm();
    clearInlineError("#error-container");

    var data;

    if (id)
      data = findWorkflow(id);

    // Check if it's an edit or new record

    if (id) {

      $("#id").val(data.id);
      $("#name").val(_.unescape(data.name));
      $("#description").val(_.unescape(data.description));
      $("#target").val(data.targetId);
    }
    else {

      $("#id").val("");
      $("#name").val("");
      $("#description").val("");
      $("#target").val("");
      $("#workflow").val("");
    }

    // Open Workflow Edit Area

    $("#modeling-list").hide();
    $("#modeling-edit").removeClass('hide');
    $("#modeling-edit").show();

    $("#workflow-editor").html("");
    instance.deleteEveryEndpoint();

    if (id)
      loadWorkflow(_.unescape(data.workflow));
  }


  // Save modeling

  function saveWorkflow() {

    // Clear any validation errors

    validator.resetForm();
    clearInlineError("#error-container");

    // Validate modeling input

    if ($("#modeling-edit-form").validate().form() == false)
      return;

    var workflow = {};

    workflow.id = $("#id").val();
    workflow.name = $("#name").val();
    workflow.description = $("#description").val();
    workflow.targetId = $("#target").val();
    workflow.workflow = getWorkflow(workflow.name, workflow.description);

    var savedWorkflow = null;
    var message = null;
    spin(".st-container", true);
    $.ajax({
      contentType: "application/json",
      processData: false,
      data: JSON.stringify(workflow),
      url: "savemodelingworkflow.html",
      type: "POST",
      success: function(response) {

      if (!response.status) {

        if (response.errorCode == 'EXISTS')
           showInlineError("#error-container", messages.modeling_existserror);
         else
           showInlineError("#error-container", messages.savefailed + ' - ' + response.message);
        spin(".st-container", false);
        return;
      }

      savedWorkflow = response.data;

      validator.resetForm();
      $("#modeling-edit").hide();
      $("#modeling-list").show();

      if (workflow.id != 0) {

        title = "Workflow Updated";
        message = "Workflow information has been updated."
        updateRow(savedWorkflow);
      }
      else {

        title = "Workflow Created";
        message = "A new workflow record has been created.";
        addRow(savedWorkflow);
      }

      showSuccessMessage(title, message);

     },
     error: function(request, status, thrownError){

       spin(".st-container", false);
       showInlineError("#error-container", messages.servererror + ' - ' + response.message);
       return;
     },
     complete : function(request, status) {
         spin(".st-container", false);
     }

    });
  }


  // Get the workflow
  function getWorkflow(name, description){

    var nodes = [];

    $(".window").each(function (idx, elem) {
      var $elem = $(elem);
      var endpoints = window.jsp.getEndpoints($elem.attr('id'));

      nodeType = $elem.attr('data-nodetype');
     
      var nodeData = {
        blockId: $elem.attr('id'),
        nodeType: $elem.attr('data-nodetype'),
        positionX: parseInt($elem.css("left"), 10),
        positionY: parseInt($elem.css("top"), 10)
      };

      if (nodeType == 'dataset') {

        var datasetId = $elem.attr('dataset-id');
        nodeData.datasetId = datasetId;
        nodeData.columnNames = $.csv.toArray($elem.attr('dataset-column-names'));
        nodeData.columnTypes = $.csv.toArray($elem.attr('dataset-column-types'));
        nodeData.columnMLTypes = $.csv.toArray($elem.attr('dataset-column-mltypes'));
        nodeData.location = $elem.attr('dataset-location');
      } 
      else if (nodeType == 'splitdataset') {

        nodeData.trainSplit = $elem.attr('train-split');
        nodeData.cvSplit = $elem.attr('cv-split');
        nodeData.testSplit = $elem.attr('test-split');

      }
      else if (nodeType == 'logisticregression') {

        nodeData.regularizationParam = $elem.attr('regularization-param');
        nodeData.numberIterations = $elem.attr('number-iterations');
        nodeData.labelColumn = $elem.attr('lr-label-column');
        var featureColumns = $elem.attr('lr-feature-columns');
        
        if (featureColumns)
          nodeData.featureColumns = $.csv.toArray(featureColumns);
        
      }
      else if (nodeType === 'kmeans') {
        
        nodeData.numberClusters = $elem.attr('number-clusters');
        nodeData.numberIterations = $elem.attr('number-iterations');
        
        var clusterColumns = $elem.attr('kmeans-columns');
        if (clusterColumns)
          nodeData.clusterColumns = $.csv.toArray(clusterColumns);
         
      }
      nodes.push(nodeData);
    });

    var connections = [];

    $.each(window.jsp.getAllConnections(), function (idx, connection) {

      connections.push({
        connectionId: connection.id,
        pageSourceId: connection.sourceId,
        pageTargetId: connection.targetId /* ,
        anchors: $.map(connection.endpoints, function(endpoint) {

          return [[endpoint.anchor.x, 
            endpoint.anchor.y, 
            endpoint.anchor.orientation[0], 
            endpoint.anchor.orientation[1],
            endpoint.anchor.offsets[0],
            endpoint.anchor.offsets[1]]];
        })
*/
      });
    });

    var workflow = {};
    workflow.nodes = nodes;
    workflow.connections = connections;
    workflow.numberOfElements = nodes.length;

    var workflowJson = JSON.stringify(workflow);
    
    return workflowJson;
  }

  // load the workflow

  function loadWorkflow(workflowJson) {

    var workflow = JSON.parse(workflowJson);
    var nodes = workflow.nodes;

    $.each(nodes, function( index, elem ) {

      if (elem.nodeType === 'dataset') {

        addDataset(elem.blockId, elem.datasetId);
        asyncRetrieveAndAttachFileSchemaToNode(elem.blockId, elem.datasetId);
      }
      else if (elem.nodeType === 'hivetable'){

        addHiveTable(elem.blockId);
      }
      else if (elem.nodeType === 'splitdataset'){

        addSplitDataset(elem.blockId, elem.trainSplit, elem.cvSplit, elem.testSplit);
      }
      else if (elem.nodeType === 'logisticregression'){

        addLogisticRegression(elem.blockId, elem.regularizationParam, elem.numberIterations, elem.featureColumns, elem.labelColumn);
      }
      else if (elem.nodeType === 'kmeans') {
        addKmeans(elem.blockId, elem.numberClusters, elem.numberIterations, elem.clusterColumns);
      }
      else if (elem.nodeType === 'score'){
        addScore(elem.blockId);
      }
      else {

        return;
      }

      repositionElement(elem.blockId, elem.positionX, elem.positionY);
    });

    var connections = workflow.connections;

    $.each(connections, function( index, elem ) {

      instance.connect({ source: elem.pageSourceId, target: elem.pageTargetId});
    });

    instance.repaintEverything();
    instance.revalidate();
  }

  function repositionElement(id, posX, posY){

    $('#'+id).css('left', posX);
    $('#'+id).css('top', posY);
  }



/*
});

jsPlumb.ready(function () {
*/

// jsPlumb


    // setup some defaults for jsPlumb.
  var instance = jsPlumb.getInstance({
      Endpoint: ["Dot", {radius: 2}],
      HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2 },
      ConnectionOverlays: [
          [ "Arrow", {
              location: 1,
              id: "arrow",
              length: 14,
              foldback: 0.8
          } ] /*,
          [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
*/
      ],
      Container: "workflow-editor"
  });

  // var jsPlumbInstance = instance;

  window.jsp = instance;

  // bind a click listener to each connection; the connection is deleted. you could of course
  // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
  // happening.
  instance.bind("click", function (c) {
      showConfirm('Are you sure you want to delete this connection?', function(e) {
        instance.detach(c);
      });
      
  });

  // bind a connection listener. note that the parameter passed to this function contains more than
  // just the new connection - see the documentation for a full list of what is included in 'info'.
  // this listener sets the connection's internal
  // id as the label overlay's text.
  instance.bind("connection", function (info) {
      // info.connection.getOverlay("label").setLabel(info.connection.id);
    var target = info.target;
    var source = info.source;
    var sourceNodeType = source.getAttribute('data-nodetype');
    target.setAttribute('source-nodetype', sourceNodeType);
    target.setAttribute('source-id', info.sourceId);
    
  });


  var uid = 100;

  // Get a new uid

  function generateId(type) {

    while (true) {

      uid++;
      var id = type + "-" + uid;

      // Check if id is already in use

      if ($("#" + id).length)
        continue;

      return id;
    }
  }

  $("body").on("click", "[action='model-results']", function(e) {
    
    
    spin(".st-container", true);
    var workflowId = $("#id").val();
    var results;
    $.ajax({
      accepts: "application/json",
//      dataType: "text", 
      headers : { 'Accept': 'application/json' },
      processData : false,
      async : true,
      cache: true,
      url : "modeling/" + workflowId + "/results",
      type : "GET",
      success : function(response) {
        results = response;
        var html = "";
        $.each(results, function(){
          html += this + '<br />';
       });
        $("#model-results").html("");
        $("#model-results").html(html);
        $("#output").removeClass("active");
        $("#model-results").addClass("active");
        spin(".st-container", false);
      },
      error : function(xhr, status, thrownError) {
        spin(".st-container", false);
        if ((xhr.responseJSON) && (xhr.responseJSON[0].message)){
          thrownError = xhr.responseJSON[0].message;
        }
        showInlineError("#error-container", messages.servererror + ' - ' + thrownError);
      },
      complete : function(xhr, status) {
        spin(".st-container", false);
      }
    });
    
  });
  
  $("#execute-workflow-btn").on("click", function(e) {
    
    e.preventDefault();
    
    var workflowId = $("#id").val();

    executeWorkflow(workflowId);
    
  });
  
  // Run workflow
  $("body").on("click", "[action='runworkflow']", function(e) {

    e.preventDefault();

    var workflowId = $(this).attr("workflowid");
    var row = $(this).closest("tr").get(0);
    
    executeWorkflow(workflowId, row);
  });
  
  // Suspend workflow execution
  $("body").on("click", "[action='suspendworkflow']", function(e) {

    e.preventDefault();

    var id = $(this).attr("workflowid");
    var jobId = $(this).attr("jobid");
    var row = $(this).closest("tr").get(0);
    suspendWorkflow(id, jobId, row);
  });

  // Kill Workflow
  $("body").on("click", "[action='killworkflow']", function(e) {

    e.preventDefault();

    var id = $(this).attr("workflowid");
    var jobId = $(this).attr("jobid");
    var row = $(this).closest("tr").get(0);
    // Grey out action buttons
    killWorkflow(id, jobId, row);
  });
  
  // Resume Workflow
  $("body").on("click", "[action='resumeworkflow']", function(e) {

    e.preventDefault();

    var id = $(this).attr("workflowid");
    var jobId = $(this).attr("jobid");
    var row = $(this).closest("tr").get(0);
    resumeWorkflow(id, jobId, row);
  });
  
  // Run workflow
  function executeWorkflow(id, row) {

    if (!id) {

      showAlert(messages.rowactionfailed);
      return;
    }
   

    spin(".st-container", true);
    var jobInfo;
    $.ajax({
      contentType: "application/json",
      accepts: "application/json",
      headers : { 'Accept': 'application/json' },
      processData : false,
      async : true,
      cache: true,
      url : "modeling/" + id + "/start",
      type : "POST",
      success : function(response) {
        spin(".st-container", false);
        jobInfo = response.content;
        // This is the oozie job status returned by the REST API
        if (row !== undefined)
          updateRowStatusAndActions(row, jobInfo.status, jobInfo.id, id, jobInfo.startTime);
        
      },
      error : function(xhr, status, thrownError) {
        spin(".st-container", false);
        ajaxError(xhr, status, thrownError);
        
      },
      complete : function(xhr, status) {
        spin(".st-container", false);
      }
    });
  }
  
  // Suspend workflow
  function suspendWorkflow(id, jobId, row) {

    if (!id) {

      showAlert(messages.rowactionfailed);
      return;
    }
   

    var jobInfo;
    $.ajax({
      contentType: "application/json",
      accepts: "application/json",
      headers : { 'Accept': 'application/json' },
      processData : false,      
      async : true,
      cache: true,
      data : JSON.stringify(id),
      url : "modeling/" + jobId + "/suspend",
      type : "POST",
      success : function(response) {
        jobInfo = response.content;
        // This is the oozie job status returned by the REST API
        if (row !== undefined)
          updateRowStatusAndActions(row, jobInfo.status, jobInfo.id, id, jobInfo.startTime);
        
      },
      error : function(xhr, status, thrownError) {
        ajaxError(xhr, status, thrownError);
        
      },
      complete : function(xhr, status) {
      }
    });
  }
  
  // Kill workflow
  function killWorkflow(id, jobId, row) {

    if (!id) {

      showAlert(messages.rowactionfailed);
      return;
    }
   

    var jobInfo;
    $.ajax({
      contentType: "application/json",
      accepts: "application/json",
      headers : { 'Accept': 'application/json' },
      processData : false,
      async : true,
      cache: true,
      data : JSON.stringify(id),
      url : "modeling/" + jobId + "/kill",
      type : "POST",
      success : function(response) {
        jobInfo = response.content;
        // This is the oozie job status returned by the REST API
        if (row !== undefined)
          updateRowStatusAndActions(row, jobInfo.status, jobInfo.id, id, jobInfo.startTime);
        
      },
      error : function(xhr, status, thrownError) {
        ajaxError(xhr, status, thrownError);
        
      },
      complete : function(xhr, status) {
      }
    });
  }
  
  // Resume workflow
  function resumeWorkflow(id, jobId, row) {

    if (!id) {

      showAlert(messages.rowactionfailed);
      return;
    }
   

    var jobInfo;
    $.ajax({
      contentType: "application/json",
      accepts: "application/json",
      headers : { 'Accept': 'application/json' },
      processData : false,
      async : true,
      cache: true,
      data : JSON.stringify(id),
      url : "modeling/" + jobId + "/resume",
      type : "POST",
      success : function(response) {
        jobInfo = response.content;
        // This is the oozie job status returned by the REST API
        if (row !== undefined)
          updateRowStatusAndActions(row, jobInfo.status, jobInfo.id, id, jobInfo.startTime);
        
      },
      error : function(xhr, status, thrownError) {
        ajaxError(xhr, status, thrownError);
        
      },
      complete : function(xhr, status) {
      }
    });
  }
  
  function updateRowStatusAndActions(row, status, jobId, id, lastTime) {
    var rowPos = modelingTable.fnGetPosition(row);
    var workflowName = modelingTable.fnGetData(row,0);
    if (lastTime) {
      var lastDate = (new Date(lastTime)).toLocaleString();
      modelingTable.fnUpdate(lastDate, rowPos, 3);
    }
    modelingTable.fnUpdate(getWorkflowJobStatusSpan(id, status, jobId), rowPos, 4);
    modelingTable.fnUpdate(buildWorkflowActions({id : id, name : workflowName}, status, jobId), rowPos, 5);
  }
  
  (function pollRunningTasks() {
    setTimeout(function() {
      
      // Find job IDs to running rows
      var jobIds = [];
      $.each($("[job-status='RUNNING']"), function(index, value) {
        jobIds.push($(this).attr('jobid'));
      });
      if (jobIds.length <= 0) {
        pollRunningTasks();
        return;
      }

      var jobInfo;
      $.ajax({
        contentType: "application/json",
        accepts: "application/json",
        headers : { 'Accept': 'application/json' },
        processData : false,
        async : true,
        cache: true,
        data : JSON.stringify(jobIds),
        url : "modeling/RUNNING",
        type : "PUT",
        success : function(response) {
          jobInfo = response;
          
          // This is the oozie job status returned by the REST API
          updateRunningRowsStatusAndActions(jobInfo);
          
          
        },
        error : function(xhr, status, thrownError) {
          ajaxError(xhr, status, thrownError);
        },
        complete: pollRunningTasks
      });

     }, 30000);
 })();
  
  // HDFS Dataset
  $("#dataset-btn").on("click", function(e) {

    e.preventDefault();

    $("#window-id").val("");

    $("#dataset-id").val("");
    $("#dataset-settings").modal();

  });

  // Add a dataset node

  function addDataset(id, datasetId) {

    addNode(id, "dataset", "Dataset", 5, 0, true);
    $("#" + id).attr("dataset-id", datasetId);
  }

  function asyncRetrieveAndAttachFileSchemaToNode(elemId, datasetId) {
    
    var dataset = retrieveDatasetInfo(datasetId);
    if (dataset !== undefined) {
      var datasetJson = JSON.parse(dataset.fileSchema);
      var fieldsArray = $.map(datasetJson[0], function(v, i) { return i;});
      var sparkSqlTypesArray = $.map(datasetJson[1], function(v, i) { return v;});
      var mlibTypesArray = $.map(datasetJson[2], function(v, i) { return v;});
      $("#" + elemId).attr("dataset-column-names", fieldsArray);
      $("#" + elemId).attr("dataset-column-types", sparkSqlTypesArray);
      $("#" + elemId).attr("dataset-column-mltypes", mlibTypesArray);
      $("#" + elemId).attr("dataset-location", dataset.location);
      }
    
  }
  
  // Hive Table
  $("#hive-table-btn").on("click", function(e) {

    e.preventDefault();

    var id = generateId("hivetable");
    addHiveTable(id);
  });


  // Add a hive table node

  function addHiveTable(id) {

    addNode(id, "hivetable", "Hive Table", 5, 5, true);
  }

  // Split data
  $("#split-dataset-btn").on("click", function(e) {

    e.preventDefault();

    $("#window-id").val("");

    $("#split-dataset-train").val("");
    $("#split-dataset-cv").val("");
    $("#split-dataset-test").val("");
    $("#split-dataset-settings").modal();
  });


  function addSplitDataset(id, trainSplit, cvSplit, testSplit) {

    addNode(id, "splitdataset", "Split Dataset", 5, 5, true);
    $("#" + id).attr("train-split", trainSplit);
    $("#" + id).attr("cv-split", cvSplit);
    $("#" + id).attr("test-split", testSplit);
  }

  // Score 
  $("#score-btn").on("click", function(e) {

    e.preventDefault();
    var id = generateId("score");
    addScore(id);
  });


  function addScore(id) {

    addNode(id, "score", "Score", 0, 5, false);
  }

  // Logistic Regression
  $("#logistic-regression-btn").on("click", function(e) {

    e.preventDefault();

    $("#window-id").val("");

    $("#logistic-regression-param").val("");
    $("#logistic-regression-iterations").val("");
    $("#lr-feature-columns").val("");
    $("#lr-label-column").val("");
    $("#logistic-regression-settings").modal();
  });


  // K-means 
  $("#kmeans-btn").on("click", function(e) {

    e.preventDefault();

    $("#window-id").val("");

    $("#kmeans-iterations").val("");
    $("#kmeans-clusters").val("");
    $("#kmeans-columns").val(""); 
    
    $("#kmeans-settings").modal();
  });
  
  function addLogisticRegression(id, regularizationParam, numberIterations, featureColumns, labelColumn) {

    addNode(id, "logisticregression", "Logistic Regression", 5, 1, true);
    $("#" + id).attr("regularization-param", regularizationParam);
    $("#" + id).attr("number-iterations", numberIterations);
    $("#" + id).attr("feature-columns", featureColumns);
    $("#" + id).attr("label-column", labelColumn);
  }


  function addKmeans(id, numberClusters, numberIterations, clusterColumns) {
    addNode(id, "kmeans", "K-means", 5, 1, true);
    $("#" + id).attr("number-iterations", numberIterations);
    $("#" + id).attr("number-clusters", numberClusters);
    $("#" + id).attr("kmeans-columns", clusterColumns);
  }


  // Add a node

  function addNode(id, type, label, maxSourceCons, maxTargetCons, editable) {

    var html = "<div class='window " + type + "' data-nodetype='" + type + "' id='" + id + "'>" +
        "<div><strong>" + label + "</strong></div><div>";

    if (editable) {

      html = html + "<a href='#' class='btn btn-xs edit-node'><i class='fa fa-cog'></i></a>";
    }

    html = html + "<a href='#' class='btn btn-xs del-node'><i class='fa fa-trash'></i></a></div>" +
       "<div class='ep'></div>" +
      "</div>";
    
    $("#workflow-editor").append(html);

    var window = jsPlumb.getSelector("#" + id);

    if (maxSourceCons > 0) {

      instance.makeSource(window, {
        filter: ".ep",
        anchor: "Continuous",
        connector: [ "StateMachine", { curviness: 20 } ],
        connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
        maxConnections: maxSourceCons,
        onMaxConnections: function (info, e) {
          alert("Maximum connections reached");
        }
      });
    }

    if (maxTargetCons > 0) {

      instance.makeTarget(window, {
        dropOptions: { hoverClass: "dragHover" },
        anchor: "Continuous",
        allowLoopback: true,
        maxConnections: maxTargetCons,
        onMaxConnections: function (info, e) {
          alert("Maximum connections reached");
        }
      });
    }

    // initialise draggable elements.
    instance.draggable(window);
  }

  // Get dataset information
  function retrieveDatasetInfo (id) {

    var dataset = null;

    $.ajax({
      contentType : "application/json",
      processData : true,
      data : {id : id},
      async : false,
      url : "finddataset.html",
      type : "GET",
      success : function(response) {

        if (response.status != 0)
          dataset = response.data;
      },
      error : function(request, status, thrownError) {

      }
    });

    return dataset;
  }

  function retrieveUnderlyingDataset(sourceElemId, sourceNodeType) {
    
    // Get the window / div / node element as variable -> elem
    var elem = $("#"+ sourceElemId);
    
    if (sourceNodeType === 'dataset')
      return $("#"+ sourceElemId).attr('id');
    else if (sourceNodeType === 'splitdataset') {
      // Recursive call till you get to a dataset
      var inputElemId = elem.attr('source-id');
      var inputNodeType = elem.attr('source-nodetype');
        return retrieveUnderlyingDataset(inputElemId, inputNodeType);
    }
     
  }
  // Process "save-dataset

  $("#save-dataset-btn").click(function(e) {

    e.preventDefault();

    var id = $("#window-id").val();
    var datasetId = $("#dataset-id").val();

    if (!id) {

      id = generateId("dataset");
      addDataset(id, datasetId);
    }
    else {

      $("#" + id).attr("dataset-id", datasetId);
    }
    asyncRetrieveAndAttachFileSchemaToNode(id, datasetId);
  });


  // Process "save-split-dataset

  $("#save-split-dataset-btn").click(function(e) {

    e.preventDefault();

    var id = $("#window-id").val();
    var trainSplit = $("#split-dataset-train").val();
    var cvSplit = $("#split-dataset-cv").val();
    var testSplit = $("#split-dataset-test").val();

    if (!id) { 

      id = generateId("split-dataset");
      addSplitDataset(id, trainSplit, cvSplit, testSplit);
    }
    else {

      $("#" + id).attr("train-split", trainSplit);
      $("#" + id).attr("cv-split", cvSplit);
      $("#" + id).attr("test-split", testSplit);
    }
  });


  // Process "save-logistic-regression

  $("#save-logistic-regression-btn").click(function(e) {

    e.preventDefault();

    var id = $("#window-id").val();
    var regularizationParam = $("#logistic-regression-param").val();
    var numberIterations = $("#logistic-regression-iterations").val();
    var featureColumns = $("#lr-feature-columns").val();
    var labelColumn = $("#lr-label-column").val();
    
    if (!id) {

      id = generateId("logistic-regression");
      addLogisticRegression(id, regularizationParam, numberIterations, featureColumns, labelColumn);
    }
    else {

      $("#" + id).attr("regularization-param", regularizationParam);
      $("#" + id).attr("number-iterations", numberIterations);
      $("#" + id).attr("lr-feature-columns", featureColumns);
      $("#" + id).attr("lr-label-column", labelColumn);
    }
  });

  // Process "save-kmeans"
  $("#save-kmeans-btn").click(function(e) {

    e.preventDefault();

    var id = $("#window-id").val();
    var numberClusters = $("#kmeans-clusters").val();
    var numberIterations = $("#kmeans-iterations").val();
    var clusterColumns = $("#kmeans-fields").val();
    
    if (!id) {

      id = generateId("kmeans");
      addKmeans(id, numberClusters, numberIterations, clusterColumns);
    }
    else {

      $("#" + id).attr("number-clusters", numberClusters);
      $("#" + id).attr("number-iterations", numberIterations);
      $("#" + id).attr("kmeans-columns", clusterColumns);
    }
  });
  

  // Process edit-node

  $("body").on("click", ".edit-node", function(e) {

    e.preventDefault();

    var elem = $(this).closest(".window");
    var $elem = $(elem);

    var id = $elem.attr('id');
    var nodeType = $elem.attr('data-nodetype');

    if (nodeType == 'dataset') {

      var datasetId = $elem.attr('dataset-id');
      $("#dataset-id").val(datasetId);
      $("#dataset-settings").modal();
    }
    else if (nodeType == 'splitdataset') {

      var trainSplit = $elem.attr('train-split');
      var cvSplit    = $elem.attr('cv-split');
      var testSplit  = $elem.attr('test-split');
      
      var datasetElemId = $elem.attr('source-id');
      var inputNodetype = $elem.attr('source-nodetype');
      var inputDatasetId = $("#"+ datasetElemId).attr('dataset-id');
      
      $("#split-dataset-train").val(trainSplit);
      $("#split-dataset-cv").val(cvSplit);
      $("#split-dataset-test").val(testSplit);

      $("#split-dataset-settings").modal();
    }
    else if (nodeType == 'logisticregression') {

      var regularizationParam = $elem.attr('regularization-param');
      var numberIterations = $elem.attr('number-iterations');
      var featureColumns = $elem.attr('lr-feature-columns');
      var labelColumn = $elem.attr('lr-label-column');

      $("#logistic-regression-param").val(regularizationParam);
      $("#logistic-regression-iterations").val(numberIterations);
      
      var sourceElemId = $elem.attr('source-id');
      var sourceNodeType = $elem.attr('source-nodetype');
      var inputDatasetElemtId = retrieveUnderlyingDataset(sourceElemId, sourceNodeType);
      
      // Clear the dropdown
      $("#lr-feature-columns").html("");
      $("#lr-column-column").html("");
      
      // Retrieve the schema for the dataset in question
      var fieldsArrayStr = $("#" + inputDatasetElemtId).attr('dataset-column-names');
      var mlibTypesArrayStr = $("#" + inputDatasetElemtId).attr('dataset-column-mltypes');
      var fieldsArray;
      var mlibTypesArray
      if (fieldsArrayStr !== undefined)
         fieldsArray = $.csv.toArray(fieldsArrayStr);
      if (mlibTypesArrayStr !== undefined)
        mlibTypesArray = $.csv.toArray(mlibTypesArrayStr);
      
      if ((fieldsArray !== undefined) && (mlibTypesArray !== undefined)) {
        for (var i = 0; i < fieldsArray.length; i++) {
          var value = fieldsArray[i];
          var fieldType = mlibTypesArray[i];
          if (fieldType !== 'numeric')
            continue;
          var colHtml = "<option value='" + value + "' fieldType = '" + fieldType + "'>" + value + "</option>";
          $("#lr-feature-columns").append(colHtml);
          $("#lr-label-column").append(colHtml);
        }
        
        $("#lr-feature-columns").selectpicker('refresh');
        if (featureColumns)
          $("#lr-feature-columns").selectpicker('val', $.csv.toArray(featureColumns));
        
        $("#lr-label-column").selectpicker('refresh');
        if (labelColumn)
          $("#lr-label-column").selectpicker('val', labelColumn);
      }

      
      $("#logistic-regression-settings").modal();
    }
    else if (nodeType === 'kmeans') {
      
      var numberClusters = $elem.attr('number-clusters');
      var numberIterations = $elem.attr('number-iterations');
      var clusterColumns = $elem.attr('kmeans-columns');
      
      var sourceElemId = $elem.attr('source-id');
      var sourceNodeType = $elem.attr('source-nodetype');
      var inputDatasetElemtId = retrieveUnderlyingDataset(sourceElemId, sourceNodeType);
      
      $("#kmeans-clusters").val(numberClusters);
      $("#kmeans-iterations").val(numberIterations);
      
      // Clear the dropdown
      $("#kmeans-fields").html("");
      
      // Retrieve the schema for the dataset in question
      var fieldsArrayStr = $("#" + inputDatasetElemtId).attr('dataset-column-names');
      var mlibTypesArrayStr = $("#" + inputDatasetElemtId).attr('dataset-column-mltypes');
      var fieldsArray;
      var mlibTypesArray
      if (fieldsArrayStr !== undefined)
         fieldsArray = $.csv.toArray(fieldsArrayStr);
      if (mlibTypesArrayStr !== undefined)
        mlibTypesArray = $.csv.toArray(mlibTypesArrayStr);
      
      if ((fieldsArray !== undefined) && (mlibTypesArray !== undefined)) {
        for (var i = 0; i < fieldsArray.length; i++) {
          var value = fieldsArray[i];
          var fieldType = mlibTypesArray[i];
          if (fieldType !== 'numeric')
            continue;
          var colHtml = "<option value='" + value + "' fieldType = '" + fieldType + "'>" + value + "</option>";
          $("#kmeans-fields").append(colHtml);
        }
        
        $('#kmeans-fields').selectpicker('refresh');
        if (clusterColumns)
          $("#kmeans-fields").selectpicker('val', $.csv.toArray(clusterColumns));

      }
      
      $("#kmeans-settings").modal();
    }

    $("#window-id").val(id);
  });

  // Process del-node

  $("body").on("click", ".del-node", function(e) {

    var node = this;
    e.preventDefault();
    showConfirm('Are you sure you want to delete this node?', function(e) {
      
      var elem = $(node).closest(".window");
      var $elem = $(elem);
      var id = $elem.attr('id');

      instance.remove(id);
      $("#window-id").val("");
    });
    


  });


  jsPlumb.fire("jsPlumbWorkflowLoaded", instance);
});


