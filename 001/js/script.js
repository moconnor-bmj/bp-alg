
var diameter,
	IDbyName = {},
	commaFormat = d3.format(','),
	root,
	allOccupations = [],
	focus,
	focus0,
	k0,
	scaleFactor,
	barsDrawn = false,
	rotationText = [-14,4,23,-18,-10.5,-20,20,20,46,-30,-25,-20,20,15,-30,-15,-45,12,-15,-16,15,15,5,18,5,15,20,-20,-25]; //The rotation of each arc text

function drawAll() {
	////////////////////////////////////////////////////////////// 
	////////////////// Create Set-up variables  ////////////////// 
	////////////////////////////////////////////////////////////// 

	var width = Math.max($("#chart").width(),350) - 20,
		height = (window.innerWidth < 768 ? width : window.innerHeight - 90);

		//console.log(width);
		//console.log(height);

	var mobileSize = (window.innerWidth < 768 ? true : false);

	////////////////////////////////////////////////////////////// 
	/////////////////////// Create SVG  /////////////////////// 
	////////////////////////////////////////////////////////////// 

	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		 .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	////////////////////////////////////////////////////////////// 
	/////////////////////// Create Scales  /////////////////////// 
	////////////////////////////////////////////////////////////// 

	var colorCircle = d3.scale.ordinal()
			.domain([0,1,2,3])
			.range(['#bfbfbf','#838383','#4c4c4c','#1c1c1c']);
			
	var colorBar = d3.scale.ordinal()
			.domain(["16 to 19","20 to 24","25 to 34","35 to 44","45 to 54","55 to 64","65+"])
			.range(["#EFB605", "#E3690B", "#CF003E", "#991C71", "#4F54A8", "#07997E", "#7EB852"]);		

	diameter = Math.min(width*0.9, height*0.9);
	var pack = d3.layout.pack()
		.padding(1)
		.size([diameter, diameter])
		.value(function(d) { return d.size; })
		.sort(function(d) { return d.ID; });

	////////////////////////////////////////////////////////////// 
	//////// Function | Draw the bars inside the circles ///////// 
	////////////////////////////////////////////////////////////// 

	function drawBars() {
		
		var elementsPerBar = 7,
			barChartHeight = 0.7,
			barChartHeightOffset = 0.15;
			
		//Inside each wrapper create the complete bar chart
		d3.selectAll(".barWrapperOuter")
			.each(function(d, i){ 	
				if(this.id in dataById) {
					
					barsDrawn = true;
					
					//Save current circle data in separate variable	
					var current = d,
						currentId = this.id;
							  
					//Create a scale for the width of the bars for the current circle
					var barScale = d3.scale.linear()
						.domain([0,dataMax[dataById[this.id]].values]) //max value of bar charts in circle
						.range([0,(current.r)]); //don't make the max bar bigger than 0.7 times the radius minus the distance in between
					
					//Title inside circle
					d3.select(this).append("text")
						.attr("class","innerCircleTitle")
						.attr("y", function(d, i) { 
							d.titleHeight = (-1 + 0.25) * current.r;
							return d.titleHeight; 
						})
						.attr("dy","0em")
						.text(function(d,i) { return d.name; })
						.style("font-size", function(d) {
							//Calculate best font-size
							d.fontTitleSize = current.r / 10//this.getComputedTextLength() * 20;				
							return Math.round(d.fontTitleSize)+"px"; 
						})
						.each(function(d) { 
							d.textLength = current.r*2*0.7; 
							wrap(this, d.textLength); 
						});
					
					//Bar chart	wrapper			
					var barWrapperInner = d3.select(this).selectAll(".innerBarWrapper")
						.data(data[dataById[this.id]].values)
						.enter().append("g")
						.attr("class", "innerBarWrapper")
						.attr("x", function(d,i) { 
							//Some values are missing, set these to width 0)
							d.width = (isNaN(d.value) ? 0 : barScale(d.value)); 
							d.totalOffset = -current.r*0.3; 
							return d.totalOffset; 
						})
						.attr("y", function(d, i) { 
							d.eachBarHeight = ((1 - barChartHeightOffset) * 2 * current.r * barChartHeight)/elementsPerBar;
							d.barHeight = barChartHeightOffset*2*current.r + i*d.eachBarHeight - barChartHeight*current.r;
							return d.barHeight; 
						});
						
					//Draw the bars
					barWrapperInner.append("rect")
						.attr("class", "innerBar")
						.attr("width", function(d) { return d.width; }) 
						.attr("height", function(d) {d.height = d.eachBarHeight*0.8; return d.height;})
						.style("opacity", 0.8)
						.style("fill", function(d) { return colorBar(d.age); });
					
					//Draw the age text	next to the bars		
					barWrapperInner.append("text")
						.attr("class", "innerText")
						.attr("dx", function(d) {
							d.dx = -current.r*0.05; 
							return d.dx; 
						})
						.attr("dy", "1.5em")
						.style("font-size", function(d) {
							//Calculate best font-size
							d.fontSize = current.r / 18;				
							return Math.round(d.fontSize)+"px"; 
						})
						.text(function(d,i) { return d.age; });
						
					//Draw the value inside the bars		
					barWrapperInner.append("text")
						.attr("class", "innerValue")
						.attr("dy", "1.8em")
						.style("font-size", function(d) {
							//Calculate best font-size
							d.fontSizeValue = current.r / 22;				
							return Math.round(d.fontSizeValue)+"px"; 
						})
						.text(function(d,i) { return commaFormat(d.value); })
						.each(function(d) {
							d.valueWidth = this.getBBox().width;
						 })
						.attr("dx", function(d) {
							d.r = current.r;
							
							if(d.valueWidth*1.1 > (d.width - d.r * 0.03)) d.valuePos = "left"; 
							else d.valuePos = "right";
							
							if(d.valuePos === "left") d.valueLoc = d.width + d.r * 0.03;
							else d.valueLoc = d.width - d.r * 0.03;
							return d.valueLoc; 
						})
						.style("text-anchor", function(d) { return d.valuePos === "left" ? "start" : "end"; })
						.style("fill", function(d) { return d.valuePos === "left" ? "#333333" : "white"; }); 
				}//if
			});//each barWrapperOuter 
	}//drawBars

	////////////////////////////////////////////////////////////// 
	///////////// Function | The legend creation /////////////////
	////////////////////////////////////////////////////////////// 

	var legendSizes = [10,20,30];

	function createLegend(scaleFactor) {

		d3.select("#legendRowWrapper").style("opacity", 0);
		
		var width = $("#legendCircles").width(),
			height = legendSizes[2]*2*1.2;

		var	legendCenter = -10,
			legendBottom = height,
			legendLineLength = legendSizes[2]*1.3,
			textPadding = 5
			
		//Create SVG for the legend
		var svg = d3.select("#legendCircles").append("svg")
			.attr("width", width)
			.attr("height", height)
		  .append("g")
			.attr("class", "legendWrapper")
			.attr("transform", "translate(" + width / 2 + "," + 0 + ")")
			.style("opacity", 0);
		
		//Draw the circles
		svg.selectAll(".legendCircle")
			.data(legendSizes)
			.enter().append("circle")
			.attr('r', function(d) { return d; })
			.attr('class',"legendCircle")
			.attr('cx', legendCenter)
			.attr('cy', function(d) { return legendBottom-d; });
		//Draw the line connecting the top of the circle to the number
		svg.selectAll(".legendLine")
			.data(legendSizes)
			.enter().append("line")
			.attr('class',"legendLine")
			.attr('x1', legendCenter)
			.attr('y1', function(d) { return legendBottom-2*d; })
			.attr('x2', legendCenter + legendLineLength)
			.attr('y2', function(d) { return legendBottom-2*d; });	
		//Place the value next to the line
		svg.selectAll(".legendText")
			.data(legendSizes)
			.enter().append("text")
			.attr('class',"legendText")
			.attr('x', legendCenter + legendLineLength + textPadding)
			.attr('y', function(d) { return legendBottom-2*d; })
			.attr('dy', '0.3em')
			.text(function(d) { return commaFormat(Math.round(scaleFactor * d * d / 10)*10); });
			
	}//createLegend

	////////////////////////////////////////////////////////////// 
	///////////////// Function | Initiates /////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Create the bars inside the circles
	function runCreateBars() {
		// create a deferred object
		var r = $.Deferred();

		var counter = 0;
		while(!barsDrawn & counter < 10) { 
			drawBars();
			counter  = counter+1;
			};

		setTimeout(function () {
			// and call `resolve` on the deferred object, once you're done
			r.resolve();
		}, 100);
		// return the deferred object
		return r;
	};

	//Call to the zoom function to move everything into place
	function runAfterCompletion() {
	  createLegend(scaleFactor);
	  focus0 = root;
	  k0 = 1;
	  d3.select("#loadText").remove();
	  zoomTo(root);
	};

	//Hide the tooltip when the mouse moves away
	function removeTooltip () {
	  $('.popover').each(function() {
		$(this).remove();
	  }); 
	}
	//Show the tooltip on the hovered over slice
	function showTooltip (d) {
	  $(this).popover({
		placement: 'auto top',
		container: '#chart',
		trigger: 'manual',
		html : true,
		content: function() { 
		  return "<p class='nodeTooltip'>" + d.name + "</p>"; }
	  });
	  $(this).popover('show')
	}

	////////////////////////////////////////////////////////////// 
	///////////////// Data | Read in Age data //////////////////// 
	////////////////////////////////////////////////////////////// 

	//Global variables
	var data,
		dataMax,
		dataById = {}; 
	 
	 d3.csv("data/occupations by age.csv", function(error, csv) {
		 csv.forEach(function(d) {
			d.value = +d.value;
		 });
		 
		data = d3.nest()
			.key(function(d) { return d.ID; })
			.entries(csv);
			
		dataMax = d3.nest()
			.key(function(d) { return d.ID; })
			.rollup(function(d) { return d3.max(d, function(g) {return g.value;}); })
			.entries(csv);
		
		data.forEach(function (d, i) { 
			dataById[d.key] = i; 
		});	
	 });
	 
	//Small file to get the IDs of the non leaf circles
	d3.csv("data/ID of parent levels.csv", function(error, csv) {
		csv.forEach(function (d, i) { 
			IDbyName[d.name] = d.ID; 
		});	
	 });
	 
	////////////////////////////////////////////////////////////// 
	/////////// Read in Occupation Circle data /////////////////// 
	////////////////////////////////////////////////////////////// 
		
	d3.json("data/occupation.json", function(error, dataset) {

		var nodes = pack.nodes(dataset);
		root = dataset;
		focus = dataset;		

		////////////////////////////////////////////////////////////// 
		/////////// Create a wrappers for each occupation //////////// 
		////////////////////////////////////////////////////////////// 
		var plotWrapper = svg.selectAll("g")
			.data(nodes)
			.enter().append("g")
			.attr("class", "plotWrapper")
			.attr("id", function(d,i) {
				allOccupations[i] = d.name;
				if (d.ID != undefined) return "plotWrapper_" + d.ID;
				else return "plotWrapper_node";
			});
			
		if(!mobileSize) {
			//Mouseover only on leaf nodes		
			plotWrapper.filter(function(d) { return typeof d.children === "undefined"; })
					.on("mouseover", showTooltip)
					.on("mouseout", removeTooltip);
		}//if
		
		////////////////////////////////////////////////////////////// 
		///////////////////// Draw the circles /////////////////////// 
		////////////////////////////////////////////////////////////// 
		var circle = plotWrapper.append("circle")
				.attr("id", "nodeCircle")
				.attr("class", function(d,i) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
				.style("fill", function(d) { return d.children ? colorCircle(d.depth) : null; })
				.attr("r", function(d) { 
					if(d.ID === "1.1.1.1") scaleFactor = d.value/(d.r*d.r); 
					return d.r; 
				})
				.on("click", function(d) { if (focus !== d) zoomTo(d); else zoomTo(root); });
						
		////////////////////////////////////////////////////////////// 
		//////// Draw the titles of parent circles on the Arcs /////// 
		////////////////////////////////////////////////////////////// 	
		
		//Create the data for the parent circles only
		var overlapNode = [];
		circle
			.filter(function(d,i) { return d3.select(this).attr("class") === "node"; })
			.each(function(d,i) {
					overlapNode[i] = {
						name: d.name,
						depth: d.depth,
						r: d.r,
						x: d.x,
						y: d.y
					}
			});
		
		//Create a wrapper for the arcs and text
		var hiddenArcWrapper = svg.append("g")
			.attr("class", "hiddenArcWrapper")
			.style("opacity", 0);
		//Create the arcs on which the text can be plotted - will be hidden
		var hiddenArcs = hiddenArcWrapper.selectAll(".circleArcHidden")
			.data(overlapNode)
		   .enter().append("path")
			.attr("class", "circleArcHidden")
			.attr("id", function(d, i) { return "circleArc_"+i; })
			.attr("d", function(d,i) { return "M "+ -d.r +" 0 A "+ d.r +" "+ d.r +" 0 0 1 "+ d.r +" 0"; })
			.style("fill", "none");
		//Append the text to the arcs
		var arcText = hiddenArcWrapper.selectAll(".circleText")
			.data(overlapNode)
		   .enter().append("text")
			.attr("class", "circleText")
			.style("font-size", function(d) {
				//Calculate best font-size
				d.fontSize = d.r / 10;				
				return Math.round(d.fontSize)+"px"; 
			})
		   .append("textPath")
			.attr("startOffset","50%")
			.attr("xlink:href",function(d,i) { return "#circleArc_"+i; })
			.text(function(d) { return d.name.replace(/ and /g, ' & '); });
			
		////////////////////////////////////////////////////////////// 
		////////////////// Draw the Bar charts /////////////////////// 
		////////////////////////////////////////////////////////////// 
		
		//Create a wrapper for everything inside a leaf circle
		var barWrapperOuter = plotWrapper.append("g")
				.attr("id", function(d) {
					if (d.ID != undefined) return d.ID;
					else return "node";
				})
				.style("opacity", 0)
				.attr("class", "barWrapperOuter");
		
		////////////////////////////////////////////////////////////// 
		////////////////// Create search box ///////////////////////// 
		////////////////////////////////////////////////////////////// 

		//Create new options
		var options = allOccupations;
		var select = document.getElementById("searchBox"); 
		//Put new options into select box
		for(var i = 0; i < options.length; i++) {
			var opt = options[i];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			select.appendChild(el);
		}

		//Create combo box
		$('.combobox').combobox();
		
		// call runCreateBars and use the `done` method
		// with `runAfterCompletion` as it's parameter
		setTimeout(function() { runCreateBars().done(runAfterCompletion); }, 100);

	});
}//drawAll
