// Log represents a series of ordered entries.
function Log() {
    this.sequence = 0;
    this.value = 0;
    this.entries = [];

    this.append = function(label, data) {
        this.sequence++;
        var entry = new LogEntry(this.sequence, label, data)
        this.entries.push(entry);
        entry.apply(this);
    };
}

// LogEntry represents a single message in a log.
function LogEntry(id, label, data) {
    this.id = id;
    this.label = label;
    this.data = data;
}

// Executes a change against the log.
LogEntry.prototype.apply = function(log) {
    if(this.data.action == "add") {
        log.value += this.data.delta;
    } else if(this.data.action == "sub") {
        log.value -= this.data.delta;
    }
}

// This class is a visualization of a simple set of entries being appended
// to a sequential log. It is meant to illustrate that logs are made of
// entries which have two simple properties: an id and data.
function Intro(root) {
    var $this = this;
    this.log = new Log();
    this.root = root;
    this.svg = d3.select(root).append("svg");
    this.g = this.svg.append("g");
    this.label = this.g.append("text").attr("class", "value");
    this.settings = {
        interval: 2000,
        entry: {width: 80},
    };
    this.margin = {"top":20, "bottom":20, "left":20, "right":20};

    // Automatically generate a new item while the visualization is in view.
    this.intervalID = setInterval(function() {
        if(isInViewport($this.root)) {
            $this.generate();
        }
    }, this.settings.interval);

    // Updates the visualization.
    this.update = function() {
        var $this = this
            w = this.root.offsetWidth,
            h = this.root.offsetHeight;

        this.g.selectAll(".entry").data(this.log.entries, function(d) { return d.id; })
          .call(function(selection) {
            var g,
                transform = function(d, i) { return "translate(" + (w - $this.margin.right - (($this.log.entries.length-i) * $this.settings.entry.width)) + "," + $this.margin.top + ")"; };

            // Update
            g = selection.style("opacity", 1);
            g.transition().delay(500).duration(500)
              .attr("transform", transform)
              .each("end", function(d) { $this.updateValue(); });

            // Enter
            g = selection.enter().append("g")
              .attr("class", "entry")
              .attr("transform", transform)
              .style("opacity", 0);
            g.transition()
              .delay($this.settings.interval/2)
              .duration($this.settings.interval/2)
                .style("opacity", 1);
            g.append("rect");
            g.append("text").attr("class", "id");
            g.append("text").attr("class", "label");

            // Enter+Update
            g = selection;
            g.select("rect")
              .attr("width", $this.settings.entry.width)
              .attr("height", h - $this.margin.top - $this.margin.bottom);
            g.select("text.id")
              .attr("x", $this.settings.entry.width/2)
              .attr("transform", "translate(" + 0 + "," + (((h-$this.margin.top-$this.margin.bottom)/2)-20) + ")")
              .text(function(d) { return d.id; });
            g.select("text.label")
              .attr("x", $this.settings.entry.width/2)
              .attr("transform", "translate(" + 0 + "," + (((h-$this.margin.top-$this.margin.bottom)/2)+20) + ")")
              .text(function(d) { return d.label; });

            // Exit
            g = selection.exit();
            g.remove();
          }
        );
    };

    this.updateValue = function() {
        var w = this.root.offsetWidth,
            h = this.root.offsetHeight;
        this.g.select("text.value")
            .attr("x", w-this.margin.right-(this.settings.entry.width/2))
            .attr("y", h)
            .attr("width", this.settings.entry.width)
            .text("V=" + this.log.value);
    };

    // Generates and appends one entry to the log.
    this.generate = function() {
        // Generate a new random data item.
        var data = {delta: Math.floor(Math.random()*10)};
        if(Math.random() < 0.5) {
            data.action = "add";
        } else {
            data.action = "sub";
        }
        this.log.append(data.action+" "+data.delta, data);

        // Trim the beginning of the log if it's too long.
        var max = (this.root.offsetWidth / this.settings.entry.width) + 5;
        if(this.log.entries.length > max) {
            this.log.entries.splice(0, this.log.entries.length - max);
        }

        this.update();
    }

    // Initialize.
    this.generate();
    this.updateValue()
}

// This class manages a list of visualizations for the page.
function Visualizations() {
    this.items = [];

    // TODO: Add onresize handler.

    // Adds a visualization to the list.
    this.add = function(item) {
        this.items.push(item);
    }

    // Updates all visible visualizations.
    this.update = function() {
        this.items.forEach(function(item) {
            item.update();
        });
    };
}

// Returns true if the given element is in the viewport.
function isInViewport(elem) {
    var bbox = elem.getBoundingClientRect();
    return (bbox.bottom > 0 && bbox.top < window.innerHeight);
}

var viz = new Visualizations();
viz.add(new Intro(document.getElementById("intro0")));
viz.update();
