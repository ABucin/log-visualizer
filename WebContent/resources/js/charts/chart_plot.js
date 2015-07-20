var PlotChart = PlotChart || {};

PlotChart.colors = ["#4682B4", "#FF4500", "#B22222", "#228B22", "#DAA520", "#008080", "#9ACD32", "#8A2BE2", "#2F4F4F"],
PlotChart.line_stroke_width = "5px",
PlotChart.date = null, //last date when a DB poll was made
PlotChart.padding = 60, //visualization.chart padding
PlotChart.X_OFFSET = 1000, //offset for legend 
PlotChart.HEIGHT = 500,
PlotChart.WIDTH = (PlotChart.HEIGHT + PlotChart.X_OFFSET + 200),
PlotChart.LEGEND_WIDTH = 200,
PlotChart.TR_DR = 500;

//generates a plot visualization.chart using data received from the server
PlotChart.generatePlotChart = function(){
	PlotChart.date = new Date();
	
	d3.select("#plot_viz").selectAll("svg")
	.style("opacity", "1")
	.transition().duration(PlotChart.TR_DR)
	.style("opacity", "0")
	.remove();
	
	d3.text("acc_line?type=plot_new&date=" + PlotChart.date.getTime(), function(d){
		parsedCSV = d3.csv.parseRows(d);
		//console.log(parsedCSV);
		PlotChart.generatePlot(parsedCSV);
    });
}

//generates a plot visualization.chart
PlotChart.generatePlot = function(parsedCSV){
	//we initialize some global variables
	var rowCount = parsedCSV.length,
	hits = [],
	pages = [],
	timestamp = [],
	visibility = [];
	PlotChart.timestamp = [],
	PlotChart.hits = [],
	PlotChart.selectedLines = [],
	PlotChart.timestamp = [],
	PlotChart.hits = [],
	xLabel = "hits",
	yLabel = "timestamp";
	
	constructPageList();
	
	var pageCount = pages.length;

	//we declare some global variables
	var gtLength = PlotChart.timestamp.length,
    maxHit = d3.max(PlotChart.hits),
    earliestDate = PlotChart.timestamp[0],
    latestDate = PlotChart.timestamp[gtLength-1],
    x = d3.time.scale().domain([earliestDate, latestDate]).rangeRound([PlotChart.padding, PlotChart.WIDTH - PlotChart.X_OFFSET - PlotChart.padding + PlotChart.LEGEND_WIDTH]),
    y = d3.scale.linear().clamp(true).domain([0, maxHit]).rangeRound([PlotChart.HEIGHT - PlotChart.padding, PlotChart.padding]),
	nrSeconds = d3.time.second.range(earliestDate, latestDate).length,
	nrMinutes = d3.time.minute.range(earliestDate, latestDate).length,
	nrHours = d3.time.hour.range(earliestDate, latestDate).length,
	localTimeFormat = null;

	//we create axis for time and hits
	var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(6,3,0)
    .orient("bottom");
	//console.log("s: " +nrSeconds +" m: "+ nrMinutes);
	if(nrSeconds < 60){
		localTimeFormat = d3.time.format("%H:%M:%S");
		xAxis.ticks(d3.time.seconds)
		.tickFormat(localTimeFormat);
	} else if(nrMinutes < 60){
		localTimeFormat = d3.time.format("%H:%M");
		xAxis.ticks(d3.time.minutes)
		.tickFormat(localTimeFormat);
	} else if(nrHours < 24){
		localTimeFormat = d3.time.format("%H:%M");
		xAxis.ticks(d3.time.minutes, 30)
		.tickFormat(localTimeFormat);
	} else if(nrHours >= 24){
		localTimeFormat = d3.time.format("%b %d %H");
		xAxis.ticks(d3.time.hours)
		.tickFormat(localTimeFormat);
	}
	var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(10)
    .tickSubdivide(1)
    .tickSize(7,3,0)
    .orient("left");
	
	//we create the svg canvas for our plot
	
	var vis = null;
	if(d3.select("#plot_viz").selectAll("svg").empty()==true){
		vis = d3.select("#plot_viz")
		   .append("svg")
		     .attr("width", PlotChart.WIDTH)
		     .attr("height", PlotChart.HEIGHT)
		     .style("opacity", "1"); 
	} else {
		d3.selectAll("g").remove();
		d3.selectAll("text").remove();
		
		vis = d3.select("svg");
	}

	vis.append("svg:g")
    .attr("class", "x-axis")
    .attr("transform", "translate("+0+","+(PlotChart.HEIGHT - PlotChart.padding)+")")
    .call(xAxis);
	
	 vis.append("svg:g")
	 .attr("class", "y-axis")
	 .attr("transform", "translate("+(PlotChart.padding - 10)+","+0+")")
    .call(yAxis);
	
	 vis.append("svg:text")
	 .text(xLabel)
	 .attr("transform", "translate("+(20)+","+(PlotChart.padding - 20)+")")
	 .attr("class", "axis-label")
	 .attr("text-anchor", "center");
	 
	 vis.append("svg:text")
	 .text(yLabel)
	 .attr("transform", "translate("+(PlotChart.WIDTH - PlotChart.X_OFFSET + PlotChart.LEGEND_WIDTH)+","+(PlotChart.HEIGHT - PlotChart.padding + 5)+")")
	 .attr("class", "axis-label")
	 .attr("text-anchor", "center");
	 
	 d3.select(".x-axis").selectAll("text")
	 .attr("transform", function(){
		 return "translate("+ 15 +","+ 30 +")rotate(90)";
	 });
	 
	 vis.append("svg:g")
	 	.attr("class", "helpers");
	 vis.append("svg:g")
		.attr("class","plot_lines");
	 vis.append("svg:g")
		.attr("class","plot_circles");
	 
	 //we cycle through each page and create a helper line for it
	for(var k=0; k<pageCount; k++){
		PlotChart.selectedLines[k]=true;
		var localDataLength = hits[k].length,
		data = d3.range(0,localDataLength,1).map(function(i) {
			 var t = timestamp[k][i],
			 h = hits[k][i];
			  return {x: t, y: h};
		});
		 
		//we append helper lines for OX
		 d3.select(".helpers").selectAll(".helper"+k)
			  .data(data)
			  .enter().append("svg:line")
		  		.attr("x1", PlotChart.padding-10)
				  .attr("y1", function(d) { return y(d.y); })
				  .attr("x2", function(d) { return x(d.x); })
				  .attr("y2", function(d) { return y(d.y); })
				  .attr("class", "helper"+k)
				  .style("shape-rendering", "crispEdges")
				  .style("stroke-width", "1px")
				  .style("stroke-dasharray", "2,2")
				  .style("stroke","#777");
	}
	
	appendDataLines();
	appendCircles();
	appendLegend();
	
	//we construct list of all pages
	function constructPageList(){
		for (var i = 0; i < rowCount; i++) {
			var len = pages.length;
			if (pages.indexOf(parsedCSV[i][1]) < 0) {
				hits[len] = new Array();
				timestamp[len] = new Array();
				visibility[len] = true;
				pages.push(parsedCSV[i][1]);
			}
			var h = parseInt(parsedCSV[i][2]);
			var t = formatter.parse(parsedCSV[i][0]);
			if(PlotChart.hits.indexOf(h) < 0){
				PlotChart.hits.push(h);
			}
			if(PlotChart.timestamp.indexOf(t) < 0){
				PlotChart.timestamp.push(t);
			}
		}
		
		//for each page, we construct a line with time as X and hits as Y
		for ( var i = 0; i < rowCount; i++) {
			var k = pages.indexOf(parsedCSV[i][1]);
			if (k > -1) {
				hits[k].push(parseInt(parsedCSV[i][2])); // we add page hits
				timestamp[k].push(formatter.parse(parsedCSV[i][0])); // we add page timestamps
			}
		}
	}
	
	//we place the actual data lines on our visualization.chart
	function appendDataLines(){
		for(var k=0; k<pageCount; k++){
			var localDataLength = hits[k].length;
			var data = d3.range(0,localDataLength,1).map(function(i) {
				 var t = timestamp[k][i];
				 var h = hits[k][i];
				  return {x: t, y: h};
				});
			
			var line = d3.svg.line()
		    .interpolate("linear")
		    .x(function(d) { return x(d.x); })
		    .y(function(d) { return y(d.y); });
			 
			d3.select(".plot_lines").selectAll("#plot"+k)
			 .data(data)
			  .enter().append("svg:path")
			    .attr("id", "plot"+k)
			    .attr("d", function(d) { return line(data); })
			    .style("fill", "none")
			    .style("stroke-opacity", "0.2")
			    .style("stroke-width", PlotChart.line_stroke_width)
			    .style("stroke", PlotChart.colors[k]);
		}
	}
	
	//we put circles at the end for each point in the visualization.chart
	function appendCircles(){
		for(var k=0; k<pageCount; k++){
			var localDataLength = hits[k].length;
			var data = d3.range(0,localDataLength,1).map(function(i) {
				 var t = timestamp[k][i];
				 var h = hits[k][i];
				  return {x: t, y: h};
				});
			 
			d3.select(".plot_circles").selectAll("#plot_circle"+k)
			    .data(data)
			  .enter().append("svg:circle")
					  	.style("fill", "#fff")
					    .style("stroke-width", "1.5px")
			  			.style("stroke", PlotChart.colors[k])
			  			.attr("id", "plot_circle"+k)
					    .attr("cx", function(d) { return x(d.x); })
					    .attr("cy", function(d) { return y(d.y); })
					    .attr("r", 4.5)
					    .on("mouseover", function(d){
					    	highlightLabel(d, "red");
					    })
					    .on("mouseout", function(d){
					    	highlightLabel(d, "#333");
					    });
		} 	
		
		function highlightLabel(d, color){
			var t = d.x;
	    	d3.select(".x-axis").selectAll("text")
	    	.each(function(d, i){
	    		if(localTimeFormat(d) == localTimeFormat(t)){
	    			d3.select(this).style("fill", color);
	    		}
	    	});
		}
		
	}
	
	//we append a legend to our visualization.chart
	function appendLegend(){
		vis.append("svg:g")
		.attr("id","plot_legend");
			
		for(var j=0; j<pageCount; j++){
	    	d3.select("#plot_legend")
	    	.append("svg:rect")
	    		.attr("x",PlotChart.X_OFFSET)
	    		.attr("y",(20*j + 10))
	    		.attr("width",15)
	    		.attr("height",15)
	    		.attr("fill", PlotChart.colors[j])
	    		.attr("id", j)
	    		.style("fill-opacity", "0.7")
				.on("click", function(){
					var i = d3.select(this).attr("id");
					if(PlotChart.selectedLines[i] == false){
						PlotChart.toggleLines("on", i);
						var oldColor = d3.select(this).attr("stroke");
						d3.select(this)
							.attr("fill", oldColor)
							.attr("stroke", "white")
							.attr("stroke-width", "0");
					} else {
						PlotChart.toggleLines("off", i);
						var oldColor = d3.select(this).attr("fill");
						d3.select(this)
							.attr("fill", "white")
							.attr("stroke", oldColor)
							.attr("stroke-width", "1.5px");
					}
				});
	    	
	    	d3.select("#plot_legend")
	    	.append("svg:text")
	    		.attr("class", "legend description")
	    		.text(function(){
	    			var first = pages[j].indexOf(" "),
	    			last = pages[j].indexOf("HTTP");
	    			return pages[j].substring(first, last);
	    		})
	    		.attr("color", "black")
		    	.attr("transform", function(d) {
			    	return "translate("+ (PlotChart.X_OFFSET + 30)+","+(20*j + 22) + ")"; 
		        })
		        .attr("id", j);
	    }
	}
}

//toggles visualization.chart lines (must remain inside the main function!!!)
PlotChart.toggleLines = function (mode, ix) {
	var strokeOp = "", op = "", flag = true;

	if (mode == "on") {
		strokeOp = "0.2", op = "1", flag = true;
	} else if (mode == "off"){
		strokeOp = "0", op = "0", flag = false;
	}

	d3.selectAll("#plot" + ix).style("stroke-opacity", strokeOp);
	d3.selectAll("#plot_circle" + ix).style("opacity", op);
	d3.selectAll(".helper" + ix).style("opacity", op);
	PlotChart.selectedLines[ix] = flag;
}