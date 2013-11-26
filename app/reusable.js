// see http://bost.ocks.org/mike/chart/
// BEN: BASICALLY: implement reusable components as closures with getter-setter methods

function timeSeriesChart() {

  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; }, // BEN: default x-accessor
      yValue = function(d) { return d[1]; }, // BEN: default y-accessor
      xScale = d3.time.scale(),              // BEN: d3 time scale (knows how to format ticks)
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      area = d3.svg.area().x(X).y1(Y),       // BEN: path generator (area)
      line = d3.svg.line().x(X).y(Y);        // BEN: path generator (line)

  function chart(selection) {
    selection.each(function(data) { // BEN: iterate over selection (d3 passes in their data)

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
          // BEN: xValue / yValue reference accessors defined by client-code
          // BEN: "call()" sets "data" as "this"
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; })) // BEN: d3.extent gets max/min in array
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]); // BEN: ???????

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0])); // BEN: area's y0 (baseline) constant

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}



d3.csv("reusable.csv", function(data) {
  var formatDate = d3.time.format("%b %Y"); // BEN: %b is month, %Y is year
                                            // BEN: example input: "Feb 2003"
                                            // BEN: d3 parses this to a Date object

  // d3.select("#example")
  //     .datum(data)
  //   .call(timeSeriesChart()
  //     .x(function(d) { return formatDate.parse(d.date); })
  //     .y(function(d) { return +d.price; }));

  // alternatively
  var chart = timeSeriesChart()
                .x(function(d) { return formatDate.parse(d.date); }) // set x-accessor
                .y(function(d) { return +d.price; });                // set y-accessor

  d3.select("#example2")
      .datum(data)  // bind data to selection
      .call(chart); // calls our chart, passing in selection
  
  // d3.select("#example3")
  //     .datum(data)
  //     .call(chart);
  
  // TODO: check the example!!!
  // http://stackoverflow.com/questions/14665786/some-clarification-on-reusable-charts
  // setInterval(function() { 
    
  // }, 5000);

});


