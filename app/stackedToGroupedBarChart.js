// see http://bl.ocks.org/mbostock/3943967

var n = 4, // number of layers
    m = 25, // number of samples per layer
    stack = d3.layout.stack(),
    layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1); })),
        // BEN: here, we pass in 2-d array of data (n layers, each with m samples):
        //        [
        //            [{x: X, y: Y}, ...],
        //                  ... 
        //            [{..}, ...]
        //         ]
        // BEN: stack() calculates baseline per sample per series (adds it as "y0" val), giving:
        //        [
        //            [{x: X, y: Y, y0: Y0}, ...],
        //                  ... 
        //            [{..}, ...]
        //         ]
    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
    // BEN: group max is max thickness of any layer.
    // BEN: stack max is max thickness of the stack (i.e. the sum of layers)

var margin = {top: 40, right: 10, bottom: 20, left: 10},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()  // BEN: x-scale is ordinal
    .domain(d3.range(m))
    .rangeRoundBands([0, width], .08);

var y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

var color = d3.scale.linear()
    .domain([0, n - 1])
    .range(["#aad", "#556"]); // BEN: notice linear color scale (even though discrete num layers)
                              //      i.e. yields values along line in 3-d RGB color space.

var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(0)
    .tickPadding(6)
    .orient("bottom");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var layer = svg.selectAll(".layer")
    .data(layers)           // BEN: bind layers (one "g" for each, color individually)
  .enter().append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { return color(i); });

var rect = layer.selectAll("rect")
    .data(function(d) { return d; })  // BEN: bind samples (one "rect" for each)
  .enter().append("rect")
    .attr("x", function(d) { return x(d.x); })
    .attr("y", height)                // BEN: initial y is 0 (along x-axis)
    .attr("width", x.rangeBand())     // BEN: initial width is size of band (i.e. "stacked", not "grouped")
    .attr("height", 0);               // BEN: initial height is 0

// BEN: transition to "stacked" view
rect.transition()
    .delay(function(d, i) { return i * 10; }) // BEN: here, i is in range [0, m-1]
                                              // d3 iterates through for group for item (i.e. for layer for sample  )
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

d3.selectAll("input").on("change", change);

var timeout = setTimeout(function() {
  d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
}, 5000);

function change() {
  clearTimeout(timeout); // BEN: prevent initial autochange from happening (otherwise would be confusing)
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
}

// BEN: transition functions

function transitionGrouped() {
  y.domain([0, yGroupMax]);  // BEN: reset y domain

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
        // BEN: d3 iterates for j for i (i.e. for j=layer for i=sample)
      .attr("width", x.rangeBand() / n)
    .transition()
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); });
}

function transitionStacked() {
  y.domain([0, yStackMax]);  // BEN: reset y domain

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    .transition()
      .attr("x", function(d) { return x(d.x); })
      .attr("width", x.rangeBand());
}

// Inspired by Lee Byron's test data generator.
function bumpLayer(n, o) {

  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
  for (i = 0; i < 5; ++i) bump(a);
  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}
