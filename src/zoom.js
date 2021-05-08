function Zoom(zoomArea, trans) {
	this.zoom = d3.zoom();
	this.available = false;
	this.svg = d3.select("#mainsvg");
	this.threshold = 2;
	this.zoomed = function() {
		zoomArea.select('#matrix').attr("transform", d3.event.transform);
		zoomArea.select('#force').attr("transform", d3.event.transform);
		zoomArea.select('#path').attr("transform", d3.event.transform);

		k = d3.event.transform.k;
		x = d3.event.transform.x;
		y = d3.event.transform.y;

		trans.k = k;
	   	trans.x = x;
	   	trans.y = y;
	   	//See if we cross the 'show' threshold in either direction
   		if(k >= this.threshold)
			this.svg.selectAll("text").classed('on', true);
   		else if(k < this.threshold)
			this.svg.selectAll("text").classed('on', false);
	};

	this.zoom.scaleExtent([0.1, 3])
			 .filter(() => d3.event.altKey && !d3.event.button)
			 .on("zoom", this.zoomed);

 
	this.svg.on(".zoom", null); 
	

	this.zoom(this.svg);


}

Zoom.prototype.bind = function () {
	this.svg.on(".zoom", this.zoomed); 
};

Zoom.prototype.unbind = function () {
	this.svg.on(".zoom", null); 
}

var k=1;
var x=0;
var y=0;