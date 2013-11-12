// TODO: remove this
function checkMissingPatFams(){
  var found = [];
  var missing = [];
  eqip.clusters.forEach(function(c, i) {
    c.members.forEach(function(p, j){
      if (!(p in eqip.patFams)) {
        missing.push(p);
        console.log("MISSING: c=" + i + ", j=" + j + ", p="+p);
      } else {
        found.push(p);
      }
    });
  });
  console.log("total missing: " + missing.length);
  console.log("total found: " + found.length);  
}

// get current cluster
var cluster = eqip.clusters[eqip.selectedClusterId].members;

// get histogram
var freqs = {};
cluster.forEach(function(pId, i) { 
  var p = eqip.patFams[pId];
  if (!p) {
    // TODO: handle this better!
    //    console.log("MISSING patFam: id=" + pId);
  } else {
    var gy                = p.grantDate.slice(0, 4);
    var py                = p.priorityDate.slice(0, 4);
    freqs[gy]             = freqs[gy] || {grant: 0, priority: 0};
    freqs[py]             = freqs[py] || {grant: 0, priority: 0};
    freqs[gy]['grant']++;
    freqs[py]['priority']++;
  }
});

// TEMP: inject some fake data
var tStart = 1990;
var tEnd = 2003;
freqs = {};
d3.range(tStart, tEnd + 1).forEach(function(d){
  freqs[d] = {};
  freqs[d]['grant']    = Math.floor(Math.random() * 50);
  freqs[d]['priority'] = Math.floor(Math.random() * 50);
});

// convert to d3-style arrays of data
var data = d3.keys(freqs).map(function(d, i) { 
  return { year: +d, priority: freqs[d]['priority'], grant: freqs[d]['grant']};
});

// see http://bl.ocks.org/mbostock/3886208

var margin = {top: 20, right: 60, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(["#2f7ed8", "#0d233a"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

color.domain(["priority", "grant"]);

data.forEach(function(d) {
  var y0 = 0;
  d.freqs = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
  d.total = d.freqs[d.freqs.length - 1].y1;
});

// x-domain
var years = data.map(function(d) { return d.year; });
var minYear = d3.min(years);
var maxYear = d3.max(years);
var yearsRange = d3.range(minYear, maxYear + 1);

x.domain(yearsRange);
y.domain([0, d3.max(data, function(d) { return d.total; })]);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Patent Families");

var year = svg.selectAll(".year")
    .data(data) // bind data
  .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; });

year.selectAll("rect")
    .data(function(d) { return d.freqs; }) // bind data (inherits from parent)
  .enter().append("rect")
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); });

var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + margin.right + "," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });


