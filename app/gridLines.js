// see http://jsfiddle.net/cuckovic/Phzvy/

var data = [
    [12345, 42345, 3234, 22345, 72345, 62345, 32345, 92345, 52345, 22345],
    [1234, 4234, 3234, 2234, 7234, 6234, 3234, 9234, 5234, 2234]
];

var margin = {top: 30, right: 30, bottom: 30, left: 60},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var x = d3.scale.linear().domain([0, data[0].length]).range([0, width]),
    y = d3.scale.linear().domain([0, d3.max(data[0])]).range([height, 0]);
    xAxis = d3.svg.axis().scale(x).ticks(10).tickFormat(d3.format("d")),
    yAxis = d3.svg.axis().scale(y).ticks(10).orient("left");
    
var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);


// horizontal lines
svg.selectAll(".hline").data(d3.range(10)).enter()
  .append("line")
    .attr("y1", function (d) {
      return d * 26 + 6;
    })
    .attr("y2", function (d) {
      return d * 26 + 6;
    })
    .attr("x1", function (d) {
      return 0;
    })
    .attr("x2", function (d) {
      return width;
    })
    .style("stroke", "#eee")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//vertical lines
svg.selectAll(".vline").data(d3.range(21)).enter()
  .append("line")
    .attr("x1", function (d) {
      return d * (width / 10);
    })
    .attr("x2", function (d) {
      return d * (width / 10);
    })
    .attr("y1", function (d) {
      return 0;
    })
    .attr("y2", function (d) {
      return height;
    })
    .style("stroke", "#eee")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
// line generator
var line = d3.svg.line()
  .x(function (d, i) {  // x accessor function
    return x(i);
  })
  .y(function (d) {     // y accessor function
    return y(d);
  });

// area generator
var area = d3.svg.area()
    .x(line.x())       // x accessor function
    .y1(line.y())      // y accessor function
    .y0(y(0));         // extra y accessor function (y==0) - in order to close the path.

var lines = svg.selectAll("g")    // bind the 2 datasets to "g"
    .data(data);                  // returns one group (empty, but with 2 place holders - one for each dataset)

var aLineContainer = lines.enter().append("g")   // inserts 2 "g"s in DOM (1 per dataset)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // set translate for each of the "g"s
      // returns one group, containing the two "g"s

aLineContainer.append("path")   // appends a "path.area" element within each of the 2 "g"s
    .attr("class", "area")
    .attr("d", area);           //     use the area generator to generate path's "d" attribute
                                //     NOTICE: no need to rebind data, it is inherited.

aLineContainer.append("path")   // appends a "path.line" element within each of the 2 "g"s
    .attr("class", "line")
    .attr("d", line);           //     use the line generator to generate path's "d" attribute
                                //     NOTICE: no need to rebind data, it is inherited.

aLineContainer.selectAll(".dot")
  .data(function (d, i) {       // NOTICE: need to rebind data here, since we want
                                // to bind individual element per data item

      return d;                 // NOTE: d here is an array
                                // NOTE: this is just the identity function
  })
  .enter()
  .append("circle")
    .attr("class", "dot")
    .attr("cx", line.x())       // line generator's x access function
    .attr("cy", line.y())
    .attr("r", 3.0);


// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
    .call(xAxis);


// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis);
