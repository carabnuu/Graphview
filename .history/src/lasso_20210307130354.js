function Lasso() {
	this.circles = d3.selectAll("circle");
	this.svg = d3.select("#mainsvg");
    this.available = false;
    this.newNodes={};
    this.lasso = d3.lasso();
}

Lasso.prototype.bind = function () {
    var newNodes={};
    // Lasso functions
    
	var lassostarted = function() {
			lasso.items()
		    	//.attr("fill", "#bbb")
		    	.classed("notpossible", true)
		        .classed("lassoselected", false);
	};

	var lassodraw = function() {
	    	// Style the possible dots
			lasso.possibleItems()
			    .classed("notpossible", false)
			    .classed("possible", true);

			// Style the not possible dot
			lasso.notPossibleItems()
			    .classed("notpossible", true)
			    .classed("possible", false);
 	};

	var lassoended = function() {
			// Reset the color of all dots
		    lasso.items()
		        .classed("notpossible", false)
		        .classed("possible", false);

			// Style the selected dots
		    lasso.selectedItems()
		        .classed("lassoselected", true);
		        //.attr("fill", "red");

		    // Reset the style of the not selected dots
		    // lasso.notSelectedItems()
		    //     .attr("fill", "#bbb");

            // update graph and matrix
		    var selected = lasso.selectedItems()["_groups"][0];
		    selected.forEach(function (d) {
		    	var id = d3.select(d).attr("id").substring(1);
		    	newNodes[id] = 1;
		    });
            if(Object.keys(newNodes).length != 0) {
                //aaa = d3.select('#n'+Object.keys(newNodes)[0]);
 				 
                graph.delete(newNodes);

				//调整x y 位置！！！！！！！！！
				if(k===1){
					var m = new Matrix(d3.event.x, d3.event.y);
					console.log([d3.event.x, d3.event.y])
				}
				else{
					var tempx=(d3.event.x - x)/k;
					var tempy=(d3.event.y - y)/k;
					var m = new Matrix(tempx, tempy);
					console.log([tempx,tempy])
 				}
				 
                //console.log(Object.keys(ids));
                m.Create(Object.keys(newNodes));
                
            }

    }; 
 	var lasso = this.lasso
	    .closePathSelect(true)
	    .closePathDistance(100)
	    .items(this.circles)
	    .targetArea(this.svg)
	    .on("start", lassostarted)
	    .on("draw", lassodraw)
	    .on("end", lassoended);
 	this.svg.call(this.lasso);
};
Lasso.prototype.change=function(){
   
}
Lasso.prototype.unbind = function () {


}
 