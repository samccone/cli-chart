var Bar = require('./bar');

var defaults = {
    xlabel: null,
    ylabel: null,
    width: 80,
    height: 40,
    step: 4,
    lmargin: 10,
    direction: 'y',
    xmin: 0,
    ymin: 0
};
defaults.xmax = defaults.width;
defaults.ymax = defaults.height;

var Chart = module.exports = function(config) {
    var charm = this.charm = config.charm;
    if (!charm){
        charm = this.charm = require('charm')(process);
        this.charm.on('^C', process.exit);
    }
    this.xlabel = config.xlabel;
    this.ylabel = config.ylabel;
    this.direction = config.direction || defaults.direction;
    this.width = config.width || defaults.width;
    this.height = config.height || defaults.height;
    this.lmargin = config.lmargin || defaults.lmargin;
    this.step = config.step || defaults.step;
    this.bars = [];
    this.xmin = config.xmin || defaults.xmin;
    this.xmax = config.xmax || defaults.xmax;
    this.ymin = config.ymin || defaults.ymin;
    this.ymax = config.ymax ||  defaults.ymax;
    this.yscale = 1;
    this.xscale = 1;

    if (this.ymin || this.ymax != defaults.height) {
        this.yscale = this.height/(this.ymax - this.ymin);
    }

    if (this.xmin || this.xmax != defaults.width) {
        this.xscale = this.width/(this.xmax - this.xmin);
    }
};

Chart.prototype.addBar = function(size, color) {
    var scale = this.direction === 'y' ? this.yscale : this.xscale;
    this.bars.push(new Bar(this, Math.round(size*scale), color));
    return this;
};

Chart.prototype.drawAxes = function() {
    var charm = this.charm;
    var i = 0;
    // draw y axis
    for (i = 0; i < this.height; i++) {
        charm.write('\n');
        charm.right(this.lmargin);
        charm.write('|');
    }

    // At the bottom of the terminal weird things happen with vertical spacing. 
    // Scroll a couple lines down then come back up before drawing the bottom axis
    charm.write('\n\n');
    charm.up(2);
    charm.right(this.lmargin+1);
    
    // The cursor is now at the origin of the graph

    // draw x axis
    charm.push();
    charm.write('\n');
    charm.right(this.lmargin);
    for (i = this.lmargin-1; i < this.width; i++) {
        charm.write('-');
    }
    charm.pop();
};

Chart.prototype.labelAxes = function() {
    var charm = this.charm;
    // label y axis
    if (this.ylabel) {
        charm.push();
        var yminstr = String(this.ymin);
        charm.left(yminstr.length+2);
        charm.write(yminstr);
        // move all the way to the left of the screen on the x axis
        charm.left(this.lmargin-2);
        
        // move half way up the y axis
        charm.up(this.height/2);
        charm.write(this.ylabel);
        charm.up(this.height/2);

        // move to the top of the y axis
        var ymaxstr = String(this.ymax);
        charm.left(ymaxstr.length);
        charm.write(ymaxstr);
        charm.pop();
    }

    // label x axis
    if (this.xlabel) {
        charm.push();
        charm.write('\n\n');
        charm.right(this.lmargin+1);
        charm.write(String(this.xmin));
        charm.left(this.lmargin+1);
        charm.right(this.width/2);
        charm.write(this.xlabel);
        charm.right(this.width/2-this.lmargin);
        charm.write(String(this.xmax));
        charm.pop();

        // put the cursor back at the origin of the graph.
//        charm.up(2);
    }
};

Chart.prototype.drawBars = function() {
    var charm = this.charm;
    for (var i = 0; i < this.bars.length; i++) {
        if (this.direction === 'x') {
            if (i != 0) charm.up(this.step);
        } else {
            if (i != 0) charm.right(this.step);
        }
        charm.push();
        this.bars[i].draw();
        charm.pop();
    }
    if (this.direction === 'x') charm.down(this.step*this.bars.length+1);
    charm.write('\n\n\n');
    if (this.direction === 'y') charm.write('\n');
};

Chart.prototype.draw = function() {
    this.drawAxes();
    this.labelAxes();
    this.drawBars();
        this.charm.write('\n\n');
};
