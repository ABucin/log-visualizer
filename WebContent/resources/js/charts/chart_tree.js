var TreeChart = TreeChart || {};

TreeChart.linkDistance = 100;
TreeChart.charge = -150;
TreeChart.friction = 0.55;
TreeChart.linkStrength = 1;
TreeChart.width = 1300;
TreeChart.height = 500;
TreeChart.minRadius = 6;
TreeChart.maxRadius = 15;

TreeChart.generateTreeChart = function(){
	d3.text("acc_line?type=tree_all", function(d){
		parsedCSV = d3.csv.parseRows(d);
		//console.log(parsedCSV[0]);
		TreeChart.generateTree(parsedCSV);
    });
}

TreeChart.generateTree = function(parsedCSV){
	TreeChart.links = [];
	TreeChart.globalHits = [];
	
	d3.selectAll("svg").remove();
	
	var nodes = {},
	dataLength = parsedCSV.length,
	paths = [],
	splitPaths = [],
	roots = [];
	
	//we store data from csv
	for(var i=0; i<dataLength; i++){
		var pathsData = {};
		pathsData.path = parsedCSV[i][0];
		pathsData.hit = parseInt(parsedCSV[i][1]);
		TreeChart.globalHits.push(pathsData.hit);
		paths.push(pathsData);
	}
	
	//we construct scales for color and radius
	var maxHit = d3.max(TreeChart.globalHits), 
	t=d3.scale.linear()
		.clamp(true)
		.domain([0, maxHit])
		.rangeRound([TreeChart.minRadius, TreeChart.maxRadius]),
	c=d3.scale.quantize()
		.domain([0, maxHit])
		.range(colorbrewer.GnYlRd[9]);
	
	//we build a list of all pages and sub-pages
	for(var i=0; i<paths.length; i++){
		while(paths[i].path.length != 0){
			if(splitPaths.indexOf(paths[i].path)<0){
				splitPaths.push(paths[i].path);
			}
			paths[i].path = paths[i].path.substring(0, paths[i].path.lastIndexOf("/"));
		}
	}
	
	//console.log(splitPaths);

	//we construct the hierarchy of nodes
	constructHierarchy();

	// Compute the distinct nodes from the links.
	TreeChart.links.forEach(function(link) {
	  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
	});

	var force = d3.layout.force()
	    .nodes(d3.values(nodes))
	    .links(TreeChart.links)
	    .size([TreeChart.width, TreeChart.height])
	    .linkDistance(TreeChart.linkDistance)
	    .linkStrength(TreeChart.linkStrength)
	    .charge(TreeChart.charge)
	    .friction(TreeChart.friction)
	    .on("tick", tick)
	    .start();

	var node_drag = d3.behavior.drag()
	    .on("dragstart", dragstart)
	    .on("drag", dragmove)
	    .on("dragend", dragend);
	
	function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }
	
	var svg = d3.select("#tree_viz").append("svg:svg")
	    .attr("width", TreeChart.width)
	    .attr("height", TreeChart.height);

	var path = svg.append("svg:g").selectAll("path")
	    .data(force.links())
	  .enter().append("svg:path")
	    .attr("class", function(d) { return "link "; });

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(force.nodes())
	  .enter().append("svg:circle")
	    .attr("r", function(d, i){
	    	var rad = getHits(d);
	    	return t(rad);})
	    .attr("fill", function(d, i){
	    	var val = getHits(d);
	    	if(val == ""){
	    		return "#444";
	    	}
	    	return c(val);})
	    .attr("class", "tree")
	    .call(node_drag);

	var text = svg.append("svg:g").selectAll("g")
	    .data(force.nodes())
	  .enter().append("svg:g");

	// A copy of the text with a thick white stroke for legibility.
	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .attr("class", "shadow")
	    .text(function(d) { return d.name; });

	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .text(function(d, i) {
	    	if(roots.indexOf(d.name) > -1){
	    		d3.select(this).attr("fill", "red");
	    	} else if(d.name.indexOf(".") < 0){
	    		d3.select(this).attr("fill", "#233c66");
	    	}
	    	
	    	return d.name; });

	function constructHierarchy(){
		for(var i=0; i<splitPaths.length; i++){
			while(splitPaths[i].length>0){
				var linkData = {},
				li = splitPaths[i].lastIndexOf("/");
				linkData.source = splitPaths[i].substring(0, li);
				linkData.target = splitPaths[i];
				if(splitPaths[i].indexOf(".") > -1){
					for(var j=0; j<parsedCSV.length; j++){
						//console.log("path: "+parsedCSV[j][0]+" split: "+splitPaths[i]);
						if(parsedCSV[j][0].indexOf(splitPaths[i]) > -1){
							linkData.target += " ("+ parseInt(parsedCSV[j][1]) +")";
						}
					}
				}
				//we store all roots
				if(roots.indexOf(splitPaths[i]) < 0 && splitPaths[i].indexOf("/") == splitPaths[i].lastIndexOf("/")){
					roots.push(splitPaths[i]);
				}
				if(linkData.source!=""){
					TreeChart.links.push(linkData);
				}
				splitPaths[i] = linkData.source;
			}
		}
	}
	
	function getHits(d){
		return d.name.substring(d.name.indexOf("(")+1, d.name.indexOf(")"));
	}
	
	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
	  path.attr("d", function(d) {
	    var dx = d.target.x - d.source.x,
	        dy = d.target.y - d.source.y,
	        dr = Math.sqrt(dx * dx + dy * dy);
	    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	  });

	  circle.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });

	  text.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });
	}
}