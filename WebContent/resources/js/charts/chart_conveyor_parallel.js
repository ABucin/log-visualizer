var ConveyorParallelChart = ConveyorParallelChart || {};

//the visualization.chart is read from LEFT to RIGHT
ConveyorParallelChart.conveyor_colors = ["#8B0000", "#C0C0C0", "#909090", "#686868", "#303030"],
ConveyorParallelChart.conveyor_map = {ERROR: 0, WARN: 1, ALERT: 2, NOTICE: 3, NONE: 4},
ConveyorParallelChart.TR_DR = 500, //transition duration
ConveyorParallelChart.TR_DY = 600, //transition delay
ConveyorParallelChart.H_TR_DR = 200,//hover transition duration
ConveyorParallelChart.width = 1300,
ConveyorParallelChart.height = 700,
ConveyorParallelChart.rec_side = 40, //square side
ConveyorParallelChart.text_offset = ConveyorParallelChart.rec_side / 2 + 5, //square side
ConveyorParallelChart.rec_spacing = 1.1, //square vertical spacing
ConveyorParallelChart.nr_rec = Math.floor(ConveyorParallelChart.width / ConveyorParallelChart.rec_side), //nr. of rectangles per row
ConveyorParallelChart.rec_radius = 4,
ConveyorParallelChart.date = null, //last date when a DB poll was made
ConveyorParallelChart.oldX = -1,
ConveyorParallelChart.oldY = -1,
ConveyorParallelChart.data = [],
ConveyorParallelChart.x = d3.scale.linear()
     .domain([0, ConveyorParallelChart.nr_rec])
     .range([0, ConveyorParallelChart.width]);

ConveyorParallelChart.generateConveyorParallelChart = function(start, end, location) {
	
	if(start!=null && end != null){
		d3.text("int_line?type=conv_par_replay&start_date="+start+"&end_date="+end, function(d){
			ConveyorParallelChart.data = [];
			var parsedCSV = d3.csv.parseRows(d);
			for(var i=0; i<parsedCSV.length; i++){
				parsedCSV[i][2] = 0;
				ConveyorParallelChart.data.push(parsedCSV[i]);
			}
			console.log(ConveyorParallelChart.data);
			ConveyorParallelChart.generateConveyor(ConveyorParallelChart.data, location);
		});
	} else {
		ConveyorParallelChart.date = new Date();
		d3.text("int_line?type=conv_par_all", function(d) {
			ConveyorParallelChart.data = [];
			var parsedCSV = d3.csv.parseRows(d);
			for(var i=0; i<parsedCSV.length; i++){
				parsedCSV[i][2] = 0;
				ConveyorParallelChart.data.push(parsedCSV[i]);
			}
			console.log(ConveyorParallelChart.data);
			ConveyorParallelChart.generateConveyor(ConveyorParallelChart.data, location);
		});
	}
}

ConveyorParallelChart.updateConveyorParallelChart = function(start, end,
		location) {

	if (start != null && end != null) {
		d3.text("int_line?type=conv_par_replay&start_date="+start+"&end_date="+end, function(d){
			var parsedCSV = d3.csv.parseRows(d);
			if (parsedCSV.length > 0) {
				for ( var i = 0; i < 4; i++) {
					if (typeof parsedCSV[i] !== "undefined") {
						parsedCSV[i][2] = -1;
						ConveyorParallelChart.data.push(parsedCSV[i]);
					}
				}
			}
			for ( var i = 0; i < ConveyorParallelChart.data.length; i++) {
				ConveyorParallelChart.data[i][2]++;
			}
			console.log(ConveyorParallelChart.data);
			ConveyorParallelChart.updateConveyor(ConveyorParallelChart.data,
					location);
		});
	} else {
		d3.text("int_line?type=conv_par_new&date="
				+ ConveyorParallelChart.date.getTime(), function(d) {
			var parsedCSV = d3.csv.parseRows(d);
			if (parsedCSV.length > 0) {
				for ( var i = 0; i < 4; i++) {
					if (typeof parsedCSV[i] !== "undefined") {
						parsedCSV[i][2] = -1;
						ConveyorParallelChart.data.push(parsedCSV[i]);
					}
				}
			}
			for ( var i = 0; i < ConveyorParallelChart.data.length; i++) {
				ConveyorParallelChart.data[i][2]++;
			}
			console.log(ConveyorParallelChart.data);
			ConveyorParallelChart.updateConveyor(ConveyorParallelChart.data,
					location);
		});
		ConveyorParallelChart.date = new Date();
	}
}

//generates a conveyor visualization.chart
ConveyorParallelChart.generateConveyor = function(data, location){
	
	var vis = d3.select(location).select("#conveyor_chart");
	
	if(vis.empty() === false){
		vis.remove();
	}
	
	vis = d3.select(location)
		.append("svg")
		     .attr("width", ConveyorParallelChart.width)
		     .attr("height", ConveyorParallelChart.height)
		     .attr("id", "conveyor_chart"),
	rec = vis.selectAll("rect")
		.data(data),
	tex = vis.selectAll("text")
	.data(data);
	
	rec.enter()
		.insert("svg:rect")
		.attr("x", function(d, i){return ConveyorParallelChart.x(0);})
		.attr("y", function(d, i){return ConveyorParallelChart.posY(d[0]);})
		.attr("rx", ConveyorParallelChart.rec_radius)
		.attr("ry", ConveyorParallelChart.rec_radius)
		.attr("width", ConveyorParallelChart.rec_side)
		.attr("height", ConveyorParallelChart.rec_side)
		.attr("fill", function(d, i){
			return ConveyorParallelChart.determineColor(data[i][0]);
		})
		.attr("class", "conv_rect")
        .on("mouseover", function(d){
        	d3.select(this)
        	.attr("stroke", "black")
        	.attr("stroke-radius", 1);    	
        })
        .on("mouseout", function(d){
        	d3.select(this)
        	.attr("stroke", "none");    	
        })
        .transition().duration(1000)
        .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
	
	tex.enter()
	.insert("svg:text")
	.attr("x", function(d, i){return ConveyorParallelChart.x(0);})
	.attr("y", function(d, i){return ConveyorParallelChart.posY(d[0]);})
	.attr("dy", ConveyorParallelChart.text_offset)
	.attr("dx", ConveyorParallelChart.text_offset + 15)
	.attr("text-anchor", "middle")
	.attr("fill", function(d){
		var rez ="black";
		if(d[0] == "ERROR"){
			rez = "white";
		}
		return rez;
	})
	.text(function(d, i){return d[1];})
	.attr("class", "legend description")
    .transition().duration(1000)
    .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
}

//updates a conveyor visualization.chart
ConveyorParallelChart.updateConveyor = function(data, location){
	var vis = d3.select(location).select("#conveyor_chart")
	rect = vis.selectAll("rect")
	.data(data),
	tex = vis.selectAll("text")
	.data(data);
	
	rect.enter()
	.insert("svg:rect")
	.attr("x", function(d, i){return ConveyorParallelChart.x(d[2]-1);})
	.attr("y", function(d, i){return ConveyorParallelChart.posY(d[0]);})
	.attr("rx", ConveyorParallelChart.rec_radius)
	.attr("ry", ConveyorParallelChart.rec_radius)
	.attr("width", ConveyorParallelChart.rec_side)
	.attr("height", ConveyorParallelChart.rec_side)
	.attr("fill", function(d, i){
		return ConveyorParallelChart.determineColor(data[i][0]);
	})
	.attr("class", "conv_rect")
    .on("mouseover", function(d){
    	d3.select(this)
    	.attr("stroke", "black")
    	.attr("stroke-radius", 1);    	
    })
    .on("mouseout", function(d){
    	d3.select(this)
    	.attr("stroke", "none");    	
    })
    .transition().duration(1000)
    .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
	
	rect.each(function(d, i){
		var rec = d3.select(this),
		pos = d[2];
		
		if(pos > ConveyorParallelChart.nr_rec + 1){
			rec.remove();
			ConveyorParallelChart.data.splice(i,1);
		}
		else {
			rec.attr("x", function(d, i){return ConveyorParallelChart.x(d[2]-1);})
	        .transition().duration(1000)
	        .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
		}
	});
	
	tex.enter()
	.insert("svg:text")
	.attr("x", function(d, i){return ConveyorParallelChart.x(d[2]-1);})
	.attr("y", function(d, i){return ConveyorParallelChart.posY(d[0]);})
	.attr("dy", ConveyorParallelChart.text_offset)
	.attr("dx", ConveyorParallelChart.text_offset + 15)
	.attr("text-anchor", "middle")
	.attr("fill", function(d){
		var rez ="black";
		if(d[0] == "ERROR"){
			rez = "white";
		}
		return rez;
	})
	.text(function(d, i){return d[1];})
	.attr("class", "legend description")
    .transition().duration(1000)
    .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
		
	tex.each(function(d, i){
		var tex = d3.select(this),
		pos = d[2];
		
		if(pos > ConveyorParallelChart.nr_rec + 1){
			tex.remove();
		}
		else {
			tex.attr("x", function(d, i){return ConveyorParallelChart.x(d[2]-1);})
	        .transition().duration(1000)
	        .attr("x", function(d, i){return ConveyorParallelChart.x(d[2]);});
		}
	});
	
}

ConveyorParallelChart.posX = function(p){
	return p * ConveyorParallelChart.rec_side;
}

ConveyorParallelChart.posY = function(name){
	var rez = ConveyorParallelChart.conveyor_map[name];
	return (rez * ConveyorParallelChart.rec_side + 1) * ConveyorParallelChart.rec_spacing;
}

ConveyorParallelChart.determineColor = function(name) {
	var rez = ConveyorParallelChart.conveyor_map[name];
	return ConveyorParallelChart.conveyor_colors[rez];
}