var ConveyorChart = ConveyorChart || {};

//the visualization.chart is read from LEFT to RIGHT
ConveyorChart.conveyor_colors = ["#8B0000", "#C0C0C0", "#909090", "#686868", "#303030"],
ConveyorChart.conveyor_map = {ERROR: 0, WARN: 1, ALERT: 2, NOTICE: 3, NONE: 4},
ConveyorChart.TR_DR = 500, //transition duration
ConveyorChart.TR_DY = 600, //transition delay
ConveyorChart.H_TR_DR = 200,//hover transition duration
ConveyorChart.toggled = false,
ConveyorChart.width = 1300,
ConveyorChart.height = 700,
ConveyorChart.rec_side = 30, //square side
ConveyorChart.rec_spacing = 1.1, //square vertical spacing
ConveyorChart.nr_rec = Math.floor(ConveyorChart.width / ConveyorChart.rec_side), //nr. of rectangles per row
ConveyorChart.date = null, //last date when a DB poll was made
ConveyorChart.line = 0,
ConveyorChart.oldX = -1,
ConveyorChart.oldY = -1;

ConveyorChart.generateConveyorChart = function() {
	ConveyorChart.date = new Date();
	d3.text("int_line?type=conv_all", function(d) {
		parsedCSV = d3.csv.parseRows(d);
		console.log(parsedCSV[0]);
		ConveyorChart.generateConveyor(parsedCSV);
	});
}

ConveyorChart.updateConveyorChart = function() {
	d3.text("int_line?type=conv_new&date=" + ConveyorChart.date.getTime(), function(d) {
		parsedCSV = d3.csv.parseRows(d);
		console.log(parsedCSV[0]);
		ConveyorChart.updateConveyor(parsedCSV);
	});
	ConveyorChart.date = new Date();
}

//generates a conveyor visualization.chart
ConveyorChart.generateConveyor = function(parsedCSV){
	d3.selectAll("svg").remove();
	ConveyorChart.line = 0;
	ConveyorChart.oldX = -1;
	ConveyorChart.oldY = -1;
		
	vis = d3.select("#conv_viz")
	.append("svg")
	     .attr("width", ConveyorChart.width)
	     .attr("height", ConveyorChart.height)
	     .attr("id", "conveyor_chart");

	rec = vis.selectAll("rect")
		.data(parsedCSV);
	
	rec.enter()
		.insert("svg:rect")
		.attr("x", function(d, i){return ConveyorChart.pos(i);})
		.attr("y", function(d, i){
			if(i % ConveyorChart.nr_rec == 0){
				ConveyorChart.line++;
			}
			return ConveyorChart.line * ConveyorChart.rec_side * ConveyorChart.rec_spacing;
		})
		.attr("width", ConveyorChart.rec_side)
		.attr("height", ConveyorChart.rec_side)
		.attr("fill", function(d, i){
			return ConveyorChart.determineColor(parsedCSV[i][1]);
		})
		.attr("class", "conv_rect")
		.style("shape-rendering", "crispEdges")
        .on("click", function(d, i){
        	var x = d3.select(this).attr("x"),
        	y = d3.select(this).attr("y");
        	        	
        	if(ConveyorChart.toggled == false){
        		ConveyorChart.toggled = true;
        		ConveyorChart.oldX = x;
        		ConveyorChart.oldY = y;
            	ConveyorChart.showDescription(i, x, y, vis, d, ConveyorChart.rec_side, ConveyorChart.line);
        	} else {
        		ConveyorChart.hideDescription(i, ConveyorChart.oldX, ConveyorChart.oldY);
        		ConveyorChart.toggled = false;
        	}
        })
        .on("mouseover", function(){
        	d3.select(this)
        	.attr("width", ConveyorChart.rec_side - 2)
        	.attr("height", ConveyorChart.rec_side - 2);
        })
        .on("mouseout", function(){
        	d3.select(this)
        	.attr("width", ConveyorChart.rec_side)
        	.attr("height", ConveyorChart.rec_side);
        });
}

//updates a conveyor visualization.chart
ConveyorChart.updateConveyor = function(parsedCSV){
	var rec = d3.select("#conveyor_chart")
	.selectAll("rect")
	.data(parsedCSV);
	
	rec.enter()
		.insert("svg:rect")
		.attr("x", function(d, i){return ConveyorChart.pos(i + 1);})
		.attr("y", function(d, i){
			if(i % ConveyorChart.nr_rec == 0){
				ConveyorChart.line++;
			}
			return ConveyorChart.line * ConveyorChart.rec_side * ConveyorChart.rec_spacing;
		})
		.attr("width", ConveyorChart.rec_side)
		.attr("height", ConveyorChart.rec_side)
		.attr("fill", function(d, i){
			return ConveyorChart.determineColor(parsedCSV[i][1]);
		})
		.attr("class", "conv_rect")
		.style("shape-rendering", "crispEdges")
        .on("click", function(d, i){
        	var x = d3.select(this).attr("x"),
        	y = d3.select(this).attr("y");
        	        	
        	if(ConveyorChart.toggled == false){
        		ConveyorChart.toggled = true;
        		ConveyorChart.oldX = x;
        		ConveyorChart.oldY = y;
            	ConveyorChart.showDescription(i, x, y, vis, d, ConveyorChart.rec_side, ConveyorChart.line);
        	} else {
        		ConveyorChart.hideDescription(i, ConveyorChart.oldX, ConveyorChart.oldY);
        		ConveyorChart.toggled = false;
        	}
        })
        .transition().duration(1000)
        .attr("x", function(d, i){return ConveyorChart.pos(i);});
	
	rec.transition()
		.duration(1000)
		.attr("x", function(d, i){return ConveyorChart.pos(i);});
	
	rec.exit()
	.transition()
		.duration(1000)
		.attr("x", function(d, i){return ConveyorChart.pos(i - 1);})
	.remove();
}

ConveyorChart.pos = function(p){
	return (p % ConveyorChart.nr_rec) * ConveyorChart.rec_side;
}

//shows description of square
ConveyorChart.showDescription = function(ix, x, y, vis, data, rs, line){
	d3.selectAll(".conv_rect")
	.each(function(d,i){
		if(i == ix){
			d3.select(this)
			.transition().duration(ConveyorChart.TR_DR)
			.attr("x", 0)
			.attr("y", rs * (line + 3));
			
			vis.append("svg:text")
			.attr("x", rs + 30)
			.attr("y", rs * (line + 3.3))
			.style("font-family", "Segoe UI, Lucida Sans Console")
			.style("font-weight", "bold")
			.text("(" + data[0].substr(0, data[0].length - 2) + ") " + data[2])
			.style("opacity", "0")
			.transition().duration(ConveyorChart.TR_DR).delay(ConveyorChart.TR_DY)
			.style("opacity", "1");
			
			vis.append("svg:text")
			.attr("x", rs + 30)
			.attr("y", rs * (line + 4))
			.style("font-family", "Segoe UI, Lucida Sans Console")
			.style("font-style", "italic")
			.text(data[3])
			.style("opacity", "0")
			.transition().duration(ConveyorChart.TR_DR).delay(ConveyorChart.TR_DY)
			.style("opacity", "1");
		}
	});
}

//hides description of square
ConveyorChart.hideDescription = function(ix, x, y){
	d3.selectAll(".conv_rect")
	.each(function(d,i){
		if(i == ix){
			d3.select(this)
			.transition().duration(ConveyorChart.TR_DR)
			.attr("x", x)
			.attr("y", y);
			
			d3.selectAll("text").style("opacity", "1")
			.transition().duration(ConveyorChart.TR_DR)
			.style("opacity", "0")
			.remove();
		}
	});
}

ConveyorChart.determineColor = function(name) {
	var rez = ConveyorChart.conveyor_map[name];
	return ConveyorChart.conveyor_colors[rez];
}