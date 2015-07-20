var TimelineChart = TimelineChart || {};

TimelineChart.colors_timeline = ["#4682B4", "#FF4500", "#B22222", "#228B22", "#DAA520", "#008080", "#9ACD32", "#8A2BE2", "#2F4F4F", "salmon"],
TimelineChart.date = null, //last date when a DB poll was made
TimelineChart.width = 800,
TimelineChart.height = 600
TimelineChart.xp = 110, //padding on x
TimelineChart.yp = 20, //padding on y
TimelineChart.gp = 20, //general padding
TimelineChart.xp2 = TimelineChart.width - 300,
TimelineChart.transition_duration = 3000,
TimelineChart.diameter = 22, //diameter of interior circle
//we set the domain and range for the circle sizes
TimelineChart.requestSizeRadius = d3.scale.linear()
				.clamp(true)
				.domain([0, 1200])
				.rangeRound([5, 10]);

//generates a timeline chart within a specified time interval
TimelineChart.generateTimelineChart = function(sd, ed, location){
	
	if(sd != null && ed != null){
		d3.text("acc_line?type=line_replay&start_date=" + sd +"&end_date=" + ed, function(d) {
			parsedCSV = d3.csv.parseRows(d);
			//console.log(parsedCSV);
			TimelineChart.generateTimeline(parsedCSV, location);
		});
	} else {
		TimelineChart.date = new Date();
		d3.text("acc_line?type=line_new&date=" + (TimelineChart.date.getTime() - 3000), function(d) {
			parsedCSV = d3.csv.parseRows(d);
			//console.log(parsedCSV);
			TimelineChart.generateTimeline(parsedCSV, location);
		});
	}
}

TimelineChart.generateTimeline = function(parsedCSV, location){

	//d3.selectAll("svg").remove();
	
	var rowCount = parsedCSV.length,
	hits = new Array(),
	pages = new Array(),
	timestamp = new Array(),
	sizes = new Array(),
	ips = new Array();
	console.log(parsedCSV);
	
	populateArrays();
		
	//we add the svg canvas
	var vis = null;
	
	if(parsedCSV.length>0){
		if(d3.select(location).select("svg").empty()==false){
			console.log("removing data...");
			vis = d3.select(location).select("svg");
			//we remove the old data
			vis.selectAll("text").remove();
			vis.selectAll("circle.ip_circ").remove();
			vis.selectAll("circle.page_circ").remove();
		} else {
				vis = d3.select(location)
				.append("svg")
			     .attr("width", TimelineChart.width)
			     .attr("height", TimelineChart.height);
		}
		
		for(var j=0; j<rowCount; j++){
			appendCircles();
		}
		
		//we add circles for each ip
		TimelineChart.generateCircle("ip_circ", ips, TimelineChart.diameter, TimelineChart.xp, TimelineChart.yp, vis);
		
		//we add circles for each page
		TimelineChart.generateCircle("page_circ", pages, TimelineChart.diameter, TimelineChart.xp2, TimelineChart.yp, vis);
		
		//we generate legend for the ips
		TimelineChart.generateLegend("ip", ips, TimelineChart.diameter, TimelineChart.gp, TimelineChart.yp, vis);
		
		//we generate legend for the pages
		TimelineChart.generateLegend("page", pages, TimelineChart.diameter, TimelineChart.xp2 + TimelineChart.gp + 15, TimelineChart.yp, vis);
	}
		
	//splits the parsedCSV into chunks
	function populateArrays(){
		//we parse the received data and put it into an array
		for (var i = 0; i < rowCount; i++) {
			var path = parsedCSV[i][2];
			
			if (pages.indexOf(path) < 0) {
				hits[pages.length] = new Array();
				timestamp[pages.length] = new Array();
				pages.push(path);
			}
			var ip = parsedCSV[i][0];
			if(ips.indexOf(ip)<0){
				ips.push(ip);
			}

			var s = parseInt(parsedCSV[i][4]);
			sizes.push(s);
		}
	}
	
	//adds data circles to the chart when each packet arrives
	function appendCircles(){
		
		var ip_ix = ips.indexOf(parsedCSV[j][0]),
		page_ix = pages.indexOf(parsedCSV[j][2]);
		
		vis.append("svg:circle")
		.attr("stroke", TimelineChart.colors_timeline[ip_ix])
		.attr("stroke-width", "3px")
		.attr("fill", "none")
		.attr("cx", TimelineChart.xp)
		.attr("cy", TimelineChart.computeCirclePositionY(ip_ix, TimelineChart.diameter, TimelineChart.yp))
		.attr("r", TimelineChart.requestSizeRadius(sizes[j]))
		.attr("class", "packet_"+j).transition()
			.duration(TimelineChart.transition_duration)
			.each("end", function(){
				d3.select(this).remove();})
			.ease("linear-in")
			.attr("cx", TimelineChart.xp2)
			.attr("cy", TimelineChart.computeCirclePositionY(page_ix, TimelineChart.diameter, TimelineChart.yp));
	}
}

//generates legend
TimelineChart.generateLegend = function(cls, data, diameter, pad_x, pad_y, vis){
	vis.selectAll("text ."+cls+"_legend")
	.data(data)
	.enter()
		.append("svg:text")
		.text(function(d) {
				var rez = null,
				last = d.indexOf("HTTP");
				if (last > -1) {
					var first = d.indexOf(" ");
					rez = d.substring(first, last);
				} else {
					rez = d;
				}
				return rez;
		})
		.attr("class", cls+"_legend")
		.attr("fill", "black")
		.attr("x", pad_x)
		.attr("y", function(d,i){return TimelineChart.computeLegendPosition(i, diameter, pad_y);});
}

//generates circles for the legends
TimelineChart.generateCircle = function(cls, data, diameter, pad_x, pad_y, vis){
	
	if(cls == "ip_circ"){
		col = function(d,i){return TimelineChart.colors_timeline[i];};
	} else {
		col = "none";
	}
	
	vis.selectAll("circle ."+cls)
	.data(data)
	.enter()
		.append("svg:circle")
		.attr("d", function(d){return d;})
		.attr("r", diameter / 2)
		.attr("cx", pad_x)
		.attr("cy", function(d,i){return TimelineChart.computeCirclePositionY(i, diameter, pad_y);})
		.attr("fill", col)
		.attr("stroke", "black")
		.style("stroke-width", "2px")
		.attr("class", cls);
}

//auxiliary function that computes position of ip legends
TimelineChart.computeLegendPosition = function(i, diameter, pad_y){
	return i * diameter * 1.7 + pad_y + 5;
}

//auxiliary function that computes circle position
TimelineChart.computeCirclePositionY = function(i, diameter, pad_y){
	var rez = i * diameter * 1.7 + pad_y;
	return rez;
}