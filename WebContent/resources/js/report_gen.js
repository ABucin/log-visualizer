var TR_DR = 500, //transition duration
TR_DY = 600, //transition delay
chart_format = "";

function toggle(type) {
	if (type == "access") {
		$("#access_log_filters").show();
		$("#internal_log_filters").hide();
		$("#chart_radio")[0].checked = true;
		$("#chart_radio").button("refresh");
		$("#chart_radio").button("option", "disabled", false);
		$("#chart_radio3").button("option", "disabled", false);
		$("#chart_radio2").button("option", "disabled", true);
	} else if (type == "internal") {
		$("#internal_log_filters").show();
		$("#access_log_filters").hide();
		$("#chart_radio2")[0].checked = true;
		$("#chart_radio2").button("refresh");
		$("#chart_radio").button("option", "disabled", true);
		$("#chart_radio3").button("option", "disabled", true);
		$("#chart_radio2").button("option", "disabled", false);
	}
}

function loadDocument() {	
	$("#url_parameter_type").multiselect({
		selectedText : "# of # selected"
	});
	$("#http_code").multiselect({
		selectedText : "# of # selected"
	});
	$("#message_type").multiselect({
		selectedText : "# of # selected"
	});
	$("#servers").multiselect({
		selectedText : "# of # selected"
	});
	
	$("#log_type").buttonset();
	$("#chart_format").buttonset();
	$("#object_size").buttonset();
	
	populateDropdowns();
	
	$("#start_ip").val("192.168.2.0");
	$("#end_ip").val("192.168.2.5");
	
	//enables the clicking of the radio buttons
	$('[name="radio"][value="false"]').attr("checked", true);
	$('[name="chart_radio"][value="false"]').attr("checked", true);
	$('[name="size_radio"][value="false"]').attr("checked", true);
	$('#log_type').buttonset("refresh");
	$('#chart_format').buttonset("refresh");
	$('#object_size').buttonset("refresh");

	var log_type = $("#log_type :radio:checked + label").text();
	toggle(log_type);
	
	$("#url_parameter_type").multiselect("checkAll");
	$("#http_code").multiselect("checkAll");
	$("#message_type").multiselect("checkAll");
	$("#servers").multiselect("checkAll");
	
	$("#log_type :radio").click(function() {
		var log_type = $("#log_type :radio:checked + label").text();
		toggle(log_type);
	});
	
	var start_date = $('#start_date'), end_date = $('#end_date');

	start_date.datetimepicker({
		showSecond : true,
		stepSecond : 1,
		timeFormat : 'hh:mm:ss'
	});
	end_date.datetimepicker({
		showSecond : true,
		stepSecond : 1,
		timeFormat : 'hh:mm:ss'
	});

	//back button data
	$('#back_button').button().click(function() {
		window.location="index.html";
	});
	
	//the part where we send data to server via Ajax
	$('#submit_button').button().click(function() {
		
		//we remove the old visualization.chart
		d3.selectAll("svg")
		.style("opacity", "1")
		.transition().duration(TR_DR)
		.style("opacity", "0")
		.remove();
		
		var sd = start_date.datetimepicker('getDate'),
		ed = end_date.datetimepicker('getDate'),
		type = $("#log_type :radio:checked + label").text(),
		size = $('#object_size_box').val(),
		url_params = "";
		
		if($("#url_parameter_type").val() != null){
			url_params = $("#url_parameter_type").val().toString();
		}
		
		var http_codes = "";
		
		if($("#http_code").val() !=null){
			http_codes = $("#http_code").val().toString();
		}
		
		var servers = "";
		
		if($("#servers").val() != null){
			servers = $("#servers").val().toString();
		}
		
		var message_type = "";
		
		if($("#message_type").val()!=null){
			message_type = $("#message_type").val().toString();
		}
		
		var size_compare = $("#object_size :radio:checked + label").text(),
		start_ip = $("#start_ip").val(),
		end_ip = $("#end_ip").val(),
		class_text = $("#class_box").val(),
		message_text = $("#message_box").val();
		
		chart_format = $("#chart_format :radio:checked + label").text();
		
		$.post("rep_gen", {
			type : type,
			start_date : sd,
			end_date : ed,
			size: size,
			url_params: url_params,
			http_codes: http_codes,
			servers: servers,
			size_compare: size_compare,
			chart_format: chart_format,
			start_ip: start_ip,
			end_ip: end_ip,
			message_type: message_type,
			class_text: class_text,
			message_text: message_text,
		}, function(data){
			createChart(data);
		}, "text");
	});
	
	function populateDropdowns(){
		//we populate the servers dropdown
		$.post("rep_gen", {
			query : "servers_all",
		}, function(data){
			var parsedCSV = d3.csv.parseRows(data),
			options='';
			for(var i=0; i<parsedCSV[0].length;i++){
				options+='<option value="'+parsedCSV[0][i]+'">'+parsedCSV[0][i]+"</option>";
			}
			$("select#servers").html(options);
			$("#servers").multiselect("refresh");
		}, "text");
		
		//we populate the http codes dropdown
		$.post("rep_gen", {
			query : "http_codes_all",
		}, function(data){
			var parsedCSV = d3.csv.parseRows(data),
			options='';
			for(var i=0; i<parsedCSV[0].length;i++){
				options+='<option value="'+parsedCSV[0][i]+'">'+parsedCSV[0][i]+"</option>";
			}
			//console.log(options);
			$("select#http_code").html(options);
			$("#http_code").multiselect("refresh");
		}, "text");
	}
}

function createChart(data) {		
	var parsedCSV = d3.csv.parseRows(data);
	console.log(parsedCSV[0]);
	chart_format = $("#chart_format :radio:checked + label").text();
	switch (chart_format) {
		case ("conveyor"): {
			ConveyorChart.generateConveyor(parsedCSV);
			break;
		}
		case ("plot"): {
			PlotChart.generatePlot(parsedCSV);
			break;
		}
		case ("tree"): {
			TreeChart.generateTree(parsedCSV);
			break;
		}
	}
	
	d3.selectAll("svg")
	.style("opacity", "0")
	.transition().duration(TR_DR)
	.style("opacity", "1");
}