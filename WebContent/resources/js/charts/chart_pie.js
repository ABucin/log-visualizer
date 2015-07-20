var PieChart = PieChart || {};

PieChart.color = ["#a83c3c", "#c9a559", "#98c959", "#59abc9"],
PieChart.toggledSecondaryChart = false,
PieChart.TR_DR = 500, //transition duration
PieChart.TR_DY = 600, //transition delay
PieChart.types = ["ERROR", "WARN", "ALERT", "NOTICE"], //message types array
PieChart.CHART_OFFSET = 30,
PieChart.LEGEND_X_OFFSET = 210,
PieChart.width = 500, //width
PieChart.height = 400, //height
PieChart.or = 170, //outer radius
PieChart.ir = 120, //inner radius
PieChart.sor = 110, //secondary outer radius
PieChart.sir = 70; //secondary inner radius

//generates pie chart
PieChart.generatePieChart = function(){
	d3.text("int_line?type=pie_all", function(d){
		parsedCSV = d3.csv.parseRows(d);
		PieChart.generatePie(parsedCSV);
    });
}

//displays secondary chart which contains server breakdown info
PieChart.showSecondaryChart = function(type, chart, servers, sor, sir, parsedCSV, mainText){
	if(PieChart.toggledSecondaryChart == false){
		PieChart.toggledSecondaryChart = true;
		
		var serverData = [], //new Array
		secondaryDataArray = [], //new Object
		serverDataSum = 0,
		ix = PieChart.types.indexOf(type),
		col = PieChart.color[ix],
		c1 = d3.rgb(col).darker(0.5).toString(),
		c2 = d3.rgb(col).darker(1).toString(),
		sec_color = d3.interpolateRgb(c1, c2);

		for(var i=0; i<parsedCSV.length; i++){
			if(parsedCSV[i][0] == type){
				var val = parseFloat(parsedCSV[i][2]);
				serverData.push(val);
				serverDataSum += val;
			}
		}
		
		for(var i=0; i<serverData.length; i++){
			var secondaryData = {},
			val = parseFloat((serverData[i] / serverDataSum * 100).toPrecision(4));
			secondaryData.label = val.toString() + "%";
			secondaryData.value = val;
			secondaryDataArray.push(secondaryData);
		}
				
		chart.data([secondaryDataArray]);
		
		var arc = d3.svg.arc() //this will create <path> elements for us using arc data
	    .outerRadius(sor)
	    .innerRadius(sir);
		
		var pie = d3.layout.pie() //this will create arc data for us given a list of values
	    .value(function(d) { return d.value; }); //we must tell it out to access the value of each element in our data array
		
		var arcs = chart.selectAll("g.slice.secondary") //this selects all <g> elements with class slice (there aren't any yet))
		.data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
	    .enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
	        .append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
	        .attr("class", "slice") //allow us to style things in the slices (like text)
	        .attr("class", "secondary")
	        .attr("id", function(d, i){
	        	return "slice" + i;
	        });
		
		arcs.append("svg:path")
        .attr("fill", function(d, i) { return sec_color(i); } ) //set the color for each slice to be chosen from the color function defined above
        .attr("d", arc)
        .on("mouseover", function(d, i){
        		mainText.text(servers[i]);
            	d3.select(this)
            	.attr("stroke", "white")
            	.attr("stroke-width", "3.5px");
            })
        .on("mouseout", function(){
        		mainText.text("Message Frequency");
            	d3.select(this)
            		.attr("stroke", "none");
        });
		
		arcs.append("svg:text") //add a label to each slice
    	.attr("transform", function(d) { //set the label's origin to the center of the arc
	    	return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle") //center the text on it's origin
        .attr("class", "pie-label")
        .attr("fill", function(d, i){
        	var f = d3.select("#slice"+i).select("path").attr("fill"),
        	l = d3.hsl(f).l,
        	rez ="";
        	if(l < 0.35){
        		rez = "white";
        	} else{
        		rez = "black";
        	}
        	return rez;
        })
        .text(function(d, i) { return secondaryDataArray[i].label; });
		
		//we apply fade-in animation to our secondary chart
		d3.selectAll(".secondary")
			.style("opacity", "0")
			.transition().duration(PieChart.TR_DR)
			.style("opacity", "1");
		
	} else {
		PieChart.toggledSecondaryChart = false;
		
		d3.selectAll(".secondary")
		.style("opacity", "1")
		.transition().duration(PieChart.TR_DR)
		.style("opacity", "0").remove();
	}
}

//generates pie chart using data received from the server
PieChart.generatePie = function(parsedCSV){
			
	d3.select("#pie_chart_legend").remove();
	d3.select("#pie_chart_transform").remove();
	
	var pieData = [0, 0, 0, 0],
	labelData = new Array(),
	serverData = new Array(),
	pieDataSum = 0.0;
	
	//we fetch data from the received message
	for ( var i = 0; i < parsedCSV.length; i++) {
		var count = parseFloat(parsedCSV[i][2]);
	pieDataSum += count;
		if(serverData.indexOf(parsedCSV[i][1] < 0)){
			serverData.push(parsedCSV[i][1]);
		}
		switch (parsedCSV[i][0]) {
			case (PieChart.types[0]): {
				pieData[0] += count;
				break;
			}
			case (PieChart.types[1]): {
				pieData[1] += count;
				break;
			}
			case (PieChart.types[2]): {
				pieData[2] += count;
				break;
			}
			case (PieChart.types[3]): {
				pieData[3] += count;
				break;
			}
		}
	}
	
	//we compute percentage of total
	for(var i=0; i<pieData.length; i++){
		pieData[i] = parseFloat((pieData[i] / pieDataSum * 100).toPrecision(4));
		labelData[i] = pieData[i].toString() + "%";
	}
		
    data = [{"label":labelData[0], "value":pieData[0]},
            {"label":labelData[1], "value":pieData[1]},
            {"label":labelData[2], "value":pieData[2]},
            {"label":labelData[3], "value":pieData[3]}];
    
    var translation = PieChart.or + PieChart.CHART_OFFSET,
    canvas = null;
    if(d3.select("#pie_chart").empty() == true){
    	canvas = d3.select("#pie_viz").append("svg") //create the SVG element inside the <body> 
        .attr("id","pie_chart")
        .attr("width", PieChart.width) //set the width and height of our visualization (these will be attributes of the <svg> tag
        .attr("height", PieChart.height);
    } else {
    	canvas = d3.select("#pie_chart");
    }
    
    var chart = canvas.append("svg:g") //make a group to hold our pie chart
    	.attr("id","pie_chart_transform")
    	.data([data]) //associate our data with the document
    	.attr("transform", "translate(" + translation + "," + translation + ")"); //move the center of the pie chart from 0, 0 to radius, radius

    var secChart = null;
    
    if(d3.select("#pie_chart_sec_transform") == false){
    	secChart = canvas.append("svg:g") //make a group to hold our pie chart
		.attr("id","pie_chart_sec_transform")
		.data([data]) //associate our data with the document
		.attr("transform", "translate(" + translation + "," + translation + ")"); //move the center of the pie chart from 0, 0 to radius, radius
    } else {
    	secChart = d3.select("#pie_chart_sec_transform");
    }
    
	var arc = d3.svg.arc() //this will create <path> elements for us using arc data
	    .outerRadius(PieChart.or)
	    .innerRadius(PieChart.ir);

	var pie = d3.layout.pie() //this will create arc data for us given a list of values
	    .value(function(d) { return d.value; }); //we must tell it out to access the value of each element in our data array

	var arcs = chart.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet))
		.data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
	    .enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
	        .append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
	        .attr("class", "slice"); //allow us to style things in the slices (like text)

    arcs.append("svg:path")
            .attr("fill", function(d, i) { return PieChart.color[i]; } ) //set the color for each slice to be chosen from the color function defined above
            .attr("d", arc)
            .on("mouseover", function(){
            	d3.select(this)
            	.attr("stroke", "white")
            	.attr("stroke-width", "3.5px");
            })
            .on("mouseout", function(){
            	d3.select(this)
            		.attr("stroke", "none");
            })
            .on("click", function(d, i){
            	PieChart.showSecondaryChart(PieChart.types[i], secChart, serverData, PieChart.sor, PieChart.sir, parsedCSV, mainText);
            }); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    arcs.append("svg:text") //add a label to each slice
    	.attr("transform", function(d) { //set the label's origin to the center of the arc
	    	return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle") //center the text on it's origin
        .attr("class", "pie-label")
        .text(function(d, i) { return data[i].label; });

    //legend code
    var mainText = null;
    if(d3.select(".description-bold") == false){
    	mainText = d3.select("#pie_chart")
        .append("svg:text")
    		.attr("text-anchor", "middle") //center the text on it's origin
    		.attr("class", "description-bold")
    		.attr("y", 1)
    		.text("Message Frequency")
    		.attr("transform", "translate(" + translation + "," + translation + ")");
    } else {
    	mainText = d3.select(".description-bold");
    }
    
    d3.select("#pie_chart")
    	.append("svg:g")
    		.attr("id","pie_chart_legend")
    		.data([data])
    	.append("svg:rect")
    		.attr("x", PieChart.or + PieChart.LEGEND_X_OFFSET)
    		.attr("y", PieChart.or)
    		.attr("width", 100)
    		.attr("height", 100)
    		.attr("fill", "white");
    
    //we append the legend to the chart    
    for(var i=0; i<data.length; i++){
    	d3.select("#pie_chart_legend")
    	.append("svg:rect")
    		.attr("x", PieChart.or + PieChart.LEGEND_X_OFFSET + 20)
    		.attr("y", (114 + 20*i))
    		.attr("width", 15)
    		.attr("height", 13)
    		.attr("fill", PieChart.color[i]);
    	d3.select("#pie_chart_legend")
    	.append("svg:text")
    		.attr("class", "pie-label")
    		.text(PieChart.types[i])
    		.attr("color", "black")
    		.attr("dy", ".35em")
	    	.attr("transform", function(d) {
		    	return "translate("+ (PieChart.or + PieChart.LEGEND_X_OFFSET + 50)+","+(120 + 20 * i) + ")"; 
	        });
    }

}