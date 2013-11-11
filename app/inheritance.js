// see http://www.crockford.com/javascript/inheritance.html

function Rapper(name, shout) {
  this.name = name;   // public member

  var count = 0;      //private var
  var that = this;

  function next() {    // private function
    var c = count;
    count = (count + 1) % 3;
    return c;
  }

  this.rap = function() { // privileged function
    var n = next() + 1;
    msg = n;
    if (n==3) {
      msg += ", " + shout;    // shout accessible from closure
      msg += ". I'm " + name; // accesses name from closure
      msg += ". " + that.name + ", y'heard"; // accesses name from ref to enclosing object
    }
    return msg;
  };
}

// public methods (add to prototype, conserves memory)


var b = new Rapper("Biggie", "now you know");
var p = new Rapper("Puffie", "all good");
