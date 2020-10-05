var clicks = 0;
var parseDate = d3.timeParse("%Y-%m-%d");
setupPlot();
d3.select("body").on("click", function() {
	clicks = clicks + 1
	console.log(clicks)
	animateLines(clicks)
})



function setupPlot() {

	d3.csv("data/weekly_crashes.csv")
	.row(function(d){ return {
		year: Number(d.year), 
		week: Number(d.week),
		crashes: Number(d.crashes), 
		week_start: parseDate(d.week_start),
		four_week_average: Number(d.four_week_average),
		group: String(d.group)
	}; 
	})
    .get(function(error,data){

    	var grouped = d3.nest().key(function(d){ return d.group}).entries(data);

    	var previousYears = grouped.filter(function(d) { return d.key.slice(0,4) !== "2020"; })
    	var currentYear = grouped.filter(function(d) { return d.key.slice(0,4) === "2020"; })

		var windowWidth = window.innerWidth || document.documentElement.clientWidth||document.body.clientWidth;
		var windowHeight = window.innerHeight || document.documentElement.clientHeight||document.body.clientHeight;

		var lrMargin = windowWidth / 6
		var tbMargin = windowHeight / 6

		var width = windowWidth / 1.5
		var height = width / 2.5

        var max = d3.max(data, function(d){ return d.four_week_average; });
        var minDate = d3.min(data, function(d){ return d.week_start; });
      	var maxDate = d3.max(data, function(d){ return d.week_start; });


		var y = d3.scaleLinear()
					.domain([0,max])
					.range([height,0]);

		var x = d3.scaleTime()
		              .domain([minDate,maxDate])
		              .range([0,width]);

		var yAxis = d3.axisLeft(y).ticks(5);
		var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b")).ticks(12);

		var svg = d3.select("body").append("svg").attr("height","100%").attr("width","100%");

		var margin = {left:lrMargin,right:lrMargin,top:tbMargin,bottom:tbMargin};

		var chartGroup = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")");

	    chartGroup.append("g").attr("class","axes").attr("transform","translate(0,"+height+")").call(xAxis);
		chartGroup.append("g").attr("class","axes").call(yAxis);

		var line = d3.line()
		                  .x(function(d){ return x(d.week_start); })
		                  .y(function(d){ return y(d.four_week_average ); });

		previousYearsPaths = chartGroup.append("g")
			.selectAll("path")
		        .data(previousYears)
		        .enter()
		        .append("path")
		        	.attr("class", "previousYears")
		        	.attr("id", function(d, i) { return "previousLine" + i;})
		        	.attr("fill", "none")
		        	.attr("stroke", "grey")
		        	.attr("opacity", 0.3)
	    			.attr("stroke-width", 1.5)
	    			.attr("d", function(d){
	      				return  line(d.values)
	      	})

	    currentYearPaths = chartGroup.append("g")
			.selectAll("path")
		        .data(currentYear)
		        .enter()
		        .append("path")
		        	.attr("class", "currentYear")
		        	.attr("id", function(d, i) { return "currentLine" + i;})
		        	.attr("fill", "none")
		        	.attr("stroke", "#386cb0")
	    			.attr("stroke-width", 5)
	    			.attr("d", function(d){
	      				return  line(d.values)
	      	})

	   	chartGroup.append("g")
	   		.selectAll("text")
	   			.data(previousYears)
	   			.enter()
	   			.append("text")
	   				.attr("class", "yearMarker")
	   				.attr("transform", function(d) { return textTranslate(d.values[d.values.length-1]); })
	   				.attr("dy", ".35em")
	   				.attr("dx", ".35em")
	   				.attr("font-size", "6pt")
	   				.attr("text-anchor", "start")
	   				.style("fill", "grey")
	   				.text(function(d) {return d.key});

	   	function textTranslate(data) {
	   		return "translate("+x(data.week_start)+","+y(data.four_week_average)+")"
	   	}

	   	chartGroup.append("g")
	   		.append("text")
	   		.attr("class", "titleTextPrevious")
	   		.attr("x", 10)             
        	.attr("y", 10)
        	.attr("text-anchor", "left")  
        	.style("font-size", (width * 0.015) + "pt")
        	.style("font-weight", "900")
        	.style("fill", "grey")  
        	.text("Weekly car crashes in Cary 2015-2019");

        chartGroup.append("g")
	   		.append("text")
	   		.attr("class", "titleTextCurrent")
	   		.attr("x", 10)             
        	.attr("y", 35)
        	.attr("text-anchor", "left")  
        	.style("font-size", (width * 0.015) + "pt")
        	.style("font-weight", "900")
        	.style("fill", "#386cb0")  
        	.text("Weekly car crashes in Cary 2020");




		const annotationData = [
		{
			id: "annotation-20201",
			note: {
				label: "Gov Cooper declares state of emergency",
				title: "March 10",
				align: "middle",
				padding: 0
			},
			data :{
				week_start: parseDate("2000-03-09"),
				four_week_average: 89
			},
			connector: {
			    end: "dot",
			    endScale: 4

			},
			color: ["#7fc97f"],
			dx: -0.026 * windowWidth,
			dy: 0.0325 * windowWidth
		},
		{
			id: "annotation-20202",
			note: {
				label: "Car crashes plummet to fewer than 40/week",
				title: "April 1",
				padding: 0

			},
			data :{
				week_start: parseDate("2000-04-06"),
				four_week_average: 34.75
			},
			connector: {
			    end: "dot",
			    endScale: 4

			},
			color: ["#7fc97f"],
			dx: -0.013 * windowWidth,
			dy: 0.013  * windowWidth
		},
		{
			id: "annotation-20203",
			note: {
				label: "Gov Cooper lifts statewide stay at home order",
				title: "May 20",
				align: "left",
				padding: 0

			},
			data :{
				week_start: parseDate("2000-05-20"),
				four_week_average: 41
			},
			connector: {
			    end: "dot",
			    endScale: 4

			},
			color: ["#7fc97f"],
			dx: 0.00976 * windowWidth,
			dy: 0.00976 * windowWidth
		}
		]

		prevAnnotations = [
		{
			note: {
				label: "Summer Bump"
			},
			data :{
				week_start: parseDate("2000-05-20"),
				four_week_average: 110
			}
		},
		{
			note: {
				label: "Back to School Slump"
			},
			data :{
				week_start: parseDate("2000-08-05"),
				four_week_average: 70
			}
		},
		{
			note: {
				label: "Holiday Bump"
			},
			data :{
				week_start: parseDate("2000-11-01"),
				four_week_average: 125
			}
		}
		]



		chartGroup.append("g")
		  .call(makeAnnotationsFunc([annotationData[0]]))
		  .attr("id", "firstAnnotation")
		  .attr("font-size", (width * 0.012) + "pt")

		chartGroup.append("g")
		  .call(makeAnnotationsFunc([annotationData[1]]))
          .attr("id", "secondAnnotation")
          .attr("font-size", (width * 0.012) + "pt")

        chartGroup.append("g")
		  .call(makeAnnotationsFunc([annotationData[2]]))
          .attr("id", "thirdAnnotation")
          .attr("font-size", (width * 0.012) + "pt")

        chartGroup.append("g")
		  .call(makeAnnotationsFunc(prevAnnotations))
          .attr("class", "prevAnnotations")
          .attr("font-size", (width * 0.01) + "pt")


	    //Initially set all visuals to not show
		d3.selectAll(".previousYears").style("opacity","0");
		d3.selectAll(".currentYear").style("opacity","0");
        d3.select("#firstAnnotation").style("opacity", "0")
        d3.select("#secondAnnotation").style("opacity", "0")
        d3.select("#thirdAnnotation").style("opacity", "0")
        d3.selectAll(".prevAnnotations").style("opacity", "0")
        d3.selectAll(".yearMarker").style("opacity", "0")
        d3.select(".titleTextCurrent").style("opacity", "0")


        function makeAnnotationsFunc(data){
        	var annotation = d3.annotation()
        	.type(d3.annotationLabel)
        	.accessors({
        		x: d => x(d.week_start),
        		y: d => y(d.four_week_average)
        	})
        	.annotations(data);

		return annotation
}

        
 })

}



function animateLines(clickCount) {
		 
if(clickCount == 1){
		
	d3.selectAll(".previousYears").style("opacity","0.2");
	d3.selectAll(".currentYear").style("opacity","0");
	
	//Select All of the lines and process them one by one
	d3.selectAll(".previousYears").each(function(d,i){

			// Get the length of each line in turn
		var totalLength = d3.select("#previousLine" + i).node().getTotalLength();
		var transitionPath = d3.transition().ease(d3.easeSin).duration(4000);
		var transitionText = d3.transition().ease(d3.easeSin).delay(4000).duration(700);

		d3.selectAll("#previousLine" + i).attr("stroke-dasharray", totalLength + " " + totalLength)
		  .attr("stroke-dashoffset", totalLength + 1)
		  .transition(transitionPath)
		  .attr("stroke-dashoffset", 0)

		d3.selectAll(".prevAnnotations").transition(transitionText).style("opacity", "1")
		d3.selectAll(".yearMarker").transition(transitionText).style("opacity", "1")

	})
} else if (clickCount == 2) {

	draw2020Line("#currentLine0")

	textTransitionDelay = d3.transition().ease(d3.easeLinear).delay(2000).duration(500);
	textTransitionNoDelay = d3.transition().ease(d3.easeLinear).delay(0).duration(500);
	d3.select("#firstAnnotation").transition(textTransitionDelay).style("opacity", "1")
	d3.select(".titleTextCurrent").transition(textTransitionNoDelay).style("opacity", "1")
	

} else if (clickCount == 3) {

	draw2020Line("#currentLine1")
	textTransition = d3.transition().ease(d3.easeLinear).delay(1200).duration(500);
	textDissappear = d3.transition().ease(d3.easeLinear).delay(500).duration(1000);
	d3.select("#secondAnnotation").transition(textTransition).style("opacity", "1")
	d3.selectAll(".prevAnnotations").transition(textDissappear).style("opacity", "0")

} else if (clickCount == 4) {

	draw2020Line("#currentLine2")
	textTransition = d3.transition().ease(d3.easeLinear).delay(200).duration(500);
	d3.select("#thirdAnnotation").transition(textTransition).style("opacity", "1")

} else {

	clicks = 0
	d3.selectAll(".line").style("opacity","0");
    d3.select("#firstAnnotation").style("opacity", "0")
    d3.select("#secondAnnotation").style("opacity", "0")
    d3.select("#thirdAnnotation").style("opacity", "0")
	
		
	}  			  
} 

function draw2020Line(lineTag) {
	// Then highlight the main line to be fully visable and give it a thicker stroke
	d3.select(lineTag).style("opacity","1");

	// First work our the total length of the line 
	var totalLength = d3.select(lineTag).node().getTotalLength();
	var transitionPath = d3.transition().ease(d3.easeSin).duration(2000);

	d3.selectAll(lineTag)
	  // Set the line pattern to be an long line followed by an equally long gap
	  .attr("stroke-dasharray", totalLength + " " + totalLength)
	  // Set the intial starting position so that only the gap is shown by offesetting by the total length of the line
	  .attr("stroke-dashoffset", totalLength)
	  // Then the following lines transition the line so that the gap is hidden...
	  .transition(transitionPath)
	  .attr("stroke-dashoffset", 0);
}
		  