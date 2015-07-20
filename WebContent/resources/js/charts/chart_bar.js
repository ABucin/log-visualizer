var BarChart = BarChart || {};

BarChart.barColors = ["#59abc9", "#98c959", "#c9a559", "#a83c3c", "#620d0d"],
BarChart.toggledSecondaryChart = false, //switch for displaying secondary data
BarChart.TR_DR = 500, //transition duration
BarChart.TR_DY = 600, //transition delay
BarChart.Y_OFFSET = 80, //visualization.chart y-axis offset
BarChart.X_OFFSET = 80, //visualization.chart x-axis offset
BarChart.WIDTH = BarChart.X_OFFSET + 1100, //visualization.chart width
BarChart.HEIGHT = 100, //visualization.chart height
BarChart.BAR_HEIGHT = 20, //bar height
BarChart.BAR_WDITH = BarChart.WIDTH / 2.5, //max bar width
BarChart.data,
BarChart.label;

// generates bar visualization.chart
BarChart.generateBarChart = function() {
	d3.text("acc_line?type=bar_all", function(d) {
		var parsedCSV = d3.csv.parseRows(d);
		//console.log(parsedCSV);
		BarChart.generateBar(parsedCSV);
	});
}

//assigns color to the bars according to the code
BarChart.assignColor = function(message) {
	var code = parseInt(message), 
	res = Math.floor((code / 100) - 1);
	return BarChart.barColors[res];
}

//generates visualization.chart that displays secondary data
BarChart.showSecondaryChart = function(data, sel, parsedCSV){	
	
	if(BarChart.toggledSecondaryChart == false){
		BarChart.toggledSecondaryChart = true;
		
		d3.select("#chart_title").text("HTTP "+data+" Code Frequency");
		
		var server = new Array(),
		server_labels = new Array();
		
		for(var i=0; i<parsedCSV.length; i++){
			if(data == parsedCSV[i][0]){
				server.push(parseInt(parsedCSV[i][1]));
				server_labels.push(parsedCSV[i][2]);
			}
		}
		
		var maxValue = d3.max(server),
		x = d3.scale.linear()
			.domain([0, maxValue])
			.rangeRound([0, BarChart.BAR_WDITH / 2]),
		NR_TICKS = BarChart.determineNrTicks(maxValue);
		
		sel.selectAll("rect.secondary")
		.data(server).enter()
		.append("rect")
			.attr("class", "secondary")
			.attr("y", function(d, i) { return i * 20; })
			.attr("width", x)
			.attr("height", BarChart.BAR_HEIGHT)
			.attr("fill", BarChart.assignColor(data))
			.on("mouseover", function(){
				var oldColor = d3.select(this).attr("fill");
				d3.select(this).attr("fill", d3.hsl(oldColor).darker());
			})
			.on("mouseout", function(){
				var oldColor = d3.select(this).attr("fill");
				d3.select(this).attr("fill", d3.hsl(oldColor).brighter());
			});
		
		sel.selectAll("line.secondary")
		.data(x.ticks(NR_TICKS))
		.enter().append("line")
			.attr("class", "secondary")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", 0)
			.attr("y2", BarChart.BAR_HEIGHT * server.length)
			.style("stroke", "#ccc");
		
		//text that represents numerical value of each bar
		sel.selectAll("text.secondary")
		.data(server)
		.enter().append("text")
			.attr("x", - 10)
			.attr("y", function(d,i) { return BarChart.BAR_HEIGHT * (i + 1 / 2);})
			.attr("dx", -3) // padding-right
			.attr("dy", ".35em") // vertical-align: middle
			.attr("text-anchor", "end") // text-align: right
			.attr("class", "bar-label")
			.attr("class", "secondary")
			.text(String);
		
		sel.selectAll("text.secondary_label")
		.data(server_labels)
		.enter().append("text")
			.attr("x", function(d, i){return 10 + x(server[i]);})
			.attr("y", function(d, i) { return BarChart.BAR_HEIGHT * (i + 1 / 2);})
			.attr("dx", -3) // padding-right
			.attr("dy", ".35em") // vertical-align: middle
			.attr("text-anchor", "start") // text-align: right
			.attr("class", "bar-label")
			.attr("class", "secondary_label")
			.text(String);
		
		sel.selectAll(".rule.secondary")
		.data(x.ticks(NR_TICKS))
		.enter().append("text")
			 .attr("class", "rule")
			 .attr("class", "secondary")
		     .attr("x", 0)
		     .attr("y", x)
		     .attr("dy", -3)
		     .attr("text-anchor", "middle")
		     .text(String)
		     .attr("transform", function(){
			 return "translate("+ 6 +","+ (-20) +")rotate(-90)";
		     });
		
		sel.append("line")
			 .attr("class", "secondary")
			 .attr("x1", 0)
			 .attr("x2", 0)
		     .attr("y1", 0)
		     .attr("y2", BarChart.BAR_HEIGHT * server.length)
		     .style("stroke", "#000");
		
		//we apply fade-in animation to our secondary visualization.chart
		sel.selectAll(".secondary")
			.style("opacity", "0")
			.transition().duration(BarChart.TR_DR)
			.style("opacity", "1");
		sel.selectAll(".secondary_label")
			.style("opacity", "0")
			.transition().duration(BarChart.TR_DR)
			.style("opacity", "1");
		
	} else {
		d3.select("#chart_title").text("HTTP Code Frequency");
		
		BarChart.toggledSecondaryChart = false;
		d3.selectAll(".secondary")
			.style("opacity", "1")
			.transition().duration(BarChart.TR_DR)
			.style("opacity", "0").remove();
		d3.selectAll(".secondary_label")
			.style("opacity", "1")
			.transition().duration(BarChart.TR_DR)
			.style("opacity", "0").remove();
	}
}

//determines nr. of ticks based on input data
BarChart.determineNrTicks = function(data){
	var step = 1;
	if(data < 100){
		step = 10;
	} else if(data > 100 && data < 1000){
		step = 100;
	} else if(data > 1000 && data < 5000){
		step = 250;
	} else {
		step = 500;
	}
		
	return Math.ceil(data / step);
}

//generates bar visualization.chart using data received from the server
BarChart.generateBar = function(parsedCSV){
	generateData(parsedCSV);
	
	d3.select("#data_rect_group").remove();
	
	var DATA_COUNT = BarChart.data.length,
	maxValue = d3.max(BarChart.data),
	NR_TICKS = BarChart.determineNrTicks(maxValue),
	canvas = null;
	
	if(d3.select("#bar_chart_transform").empty() == true){
		canvas = d3.select("#bar_viz").append("svg")
		.attr("id","bar_chart_transform")
		.attr("class", "visualization.chart")
		.attr("width", BarChart.WIDTH)
		.attr("height", BarChart.HEIGHT * BarChart.data.length / 2);
	} else {
		canvas = d3.select("#bar_chart_transform");
	}
	
	var chart;
	
	if(d3.select("#data_rect_group").empty() == true){
		chart = canvas.append("g")
		.attr("transform", "translate("+BarChart.X_OFFSET+","+BarChart.Y_OFFSET+")")
		.attr("id", "data_rect_group");
	} else {
		chart = d3.select("#data_rect_group");
	}

	//we check if we haven't already appended the secondary graph
	if(d3.select("#data_sec_rect_group").empty() == true){
		var secChart = canvas.append("g")
		.attr("transform", "translate("+(BarChart.X_OFFSET + BarChart.BAR_WDITH + 100)+","+BarChart.Y_OFFSET+")")
		.attr("id", "data_sec_rect_group");
	} else {
		secChart = d3.select("#data_sec_rect_group");
	}
		
	//we append visualization.chart title
	if(d3.select("#chart_title").empty() == true){
		d3.select("#bar_chart_transform")
	    .append("svg:text")
			.attr("text-anchor", "middle") //center the text on it's origin
			.attr("class", "description-bold")
			.attr("id", "chart_title")
			.attr("y", BarChart.Y_OFFSET / 3)
			.attr("x", BarChart.WIDTH / 2)
			.text("HTTP Code Frequency");
	}
	
	var x = d3.scale.linear()
	.domain([0, maxValue])
	.rangeRound([0, BarChart.BAR_WDITH]);
	
	chart.selectAll(".data_rect")
	.data(BarChart.data)
	.enter().append("rect")
		.attr("y", function(d, i) { return i * 20; })
		.attr("width", x)
		.attr("height", BarChart.BAR_HEIGHT)
		.attr("fill", function(d, i){
			return BarChart.assignColor(BarChart.label[i]);
		})
		.attr("class", "data_rect")
		.on("mouseover", function(){
			var oldColor = d3.select(this).attr("fill");
			d3.select(this).attr("fill", d3.hsl(oldColor).darker());
		})
		.on("mouseout", function(){
			var oldColor = d3.select(this).attr("fill");
			d3.select(this).attr("fill", d3.hsl(oldColor).brighter());
		})
		.on("click", function(d, i){
			BarChart.showSecondaryChart(BarChart.label[i], secChart, parsedCSV);
		});
	
	chart.selectAll(".bar-label")
	.data(BarChart.data)
	.enter().append("text")
		.attr("x", -10)
		.attr("y", function(d,i) { return BarChart.BAR_HEIGHT * (i + 1 / 2);})
		.attr("dx", -3) // padding-right
		.attr("dy", ".35em") // vertical-align: middle
		.attr("text-anchor", "end") // text-align: right
		.attr("class", "bar-label")
		.text(String);
	
	chart.selectAll("text.legend-description")
	.data(BarChart.label)
	.enter().append("text")
    		.attr("class", "legend-description")
    		.attr("class", "bar-label")
    		.text(function(d) {return "HTTP "+ d;})
    		.attr("color", "black")
			.attr("x", function(d, i){return 10 + x(BarChart.data[i]);})
			.attr("y", function(d, i) { return BarChart.BAR_HEIGHT * (i + 1 / 2);})
			.attr("dx", -3) // padding-right
			.attr("dy", ".35em") // vertical-align: middle
			.attr("text-anchor", "start"); // text-align: right
	
	chart.selectAll("line")
	.data(x.ticks(NR_TICKS))
	.enter().append("line")
		.attr("x1", x)
		.attr("x2", x)
		.attr("y1", 0)
		.attr("y2", BarChart.BAR_HEIGHT * BarChart.data.length)
		.style("stroke", "#ccc");
	
	chart.selectAll(".rule")
	.data(x.ticks(NR_TICKS))
	.enter().append("text")
		 .attr("class", "rule")
	     .attr("x", 0)
	     .attr("y", x)
	     .attr("dy", -3)
	     .attr("text-anchor", "middle")
	     .text(String)
	     .attr("transform", function(){
			 return "translate("+ 6 +","+ (-20) +")rotate(-90)";
	     });
	
	chart.append("line")
	     .attr("y1", 0)
	     .attr("y2", BarChart.BAR_HEIGHT * BarChart.data.length)
	     .style("stroke", "#000");
}

//populates the data array with CSV data
function generateData(parsedCSV){
	var i = 0,
	s = 0;
	BarChart.data = [];
	BarChart.label = [];
	
	while (i < parsedCSV.length) {
		var occ = parseInt(parsedCSV[i][1]),
		labelText = parsedCSV[i][0];
		
		if(BarChart.label.indexOf(labelText) < 0){
			BarChart.label.push(labelText);
			if(i > 0){
				BarChart.data.push(s);
				s = occ;
			} else {
				s += occ;
			}
		} else {
			s += occ;
		}
		i++;
	}
	BarChart.data.push(s);
}