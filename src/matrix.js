function Matrix(x, y) {
	this.id = matrix_list.length;
	this.num_nodes = 0;
	this.num_edges = 0;
	this.nodes = [];
	this.edges = [];
	this.adj_matrix = [];
	this.x = x;
	this.y = y;
	this.locallayer = d3.select('#matrix')
						.append('g')
						.attr('id', 'mat'+this.id);	
	//this.paths = paths;
}

Matrix.prototype.type = 'matrix';
Matrix.prototype.unitsize = 20;
Matrix.prototype.fontsize = 15;

//Matrix.prototype.insert
Matrix.prototype.Create = function(node) {
	var _this = this;
	//this.data = data;
	//var zoom = new Zoom(d3.select('#mainsvg'), _this.locallayer, trans);
	for (var i in node) {
		this.nodes.push(node[i]);
		matrix_nodes.push(node[i]);
	}
 	this.num_nodes = node.length;
 	originData.forEach(function(d, i) { 
		if ((node.includes(d.Source)) && (node.includes(d.Target))) {
			_this.edges.push(d);
			_this.num_edges=_this.num_edges+1;
		}
	});
	var m = this.adj_matrix;
	for (var i in node) {
		this.adj_matrix.push([]);
		for (var j in node) {
			this.adj_matrix[i].push(0)
		}
		this.adj_matrix[i][i] = 1;
	}
 	for (var i in _this.edges) {
		var x = this.nodes.indexOf(this.edges[i].Source);
		var y = this.nodes.indexOf(this.edges[i].Target);
		this.adj_matrix[x][y] = 1;
		this.adj_matrix[y][x] = 1;
	}
//	console.log(_this.edges) //邻接矩阵没问题
	matrix_list.push(this);
	this.Render();
	if (paths.created){
		//console.log(node[i])
		for (var i in node) paths.Push(node[i]);
		//console.log("yse")
	}
}

Matrix.prototype.Delete = function(id) { //delete id from one matrix
	var _this = this;
	var num = this.nodes.indexOf(id);
	var nn = matrix_nodes.indexOf(id);
	matrix_nodes.splice(nn, 1);
	if (num >= 0) {
		this.nodes.splice(num, 1);
		for (var i in this.adj_matrix) this.adj_matrix[i].splice(num, 1);
		this.adj_matrix.splice(num, 1);
		//for (var i in this.edges)
	}
	this.num_nodes--;
	paths.Delete(id);
	this.Render();
	var aaa = {};
	aaa[id] = 1; 
	console.log(aaa)
	graph.add(aaa);
}
Matrix.prototype.DeleteAll = function(nodes) { //delete id from one matrix
	for(var k=0;k<nodes.length;k++){
		let id=nodes[k];
		this.num_nodes--;
		paths.Delete(id);
		var aaa = {};
	aaa[id] = 1; 
	console.log(aaa)
	graph.add(aaa);
	}
	this.Clear();
}
Matrix.prototype.Push = function(id) {
	var _this = this;
	var num = this.nodes.indexOf(id);
	if (num < 0) {
		for (var i in this.nodes) this.adj_matrix[i].push(0);
		this.nodes.push(id);
		this.adj_matrix.push([]);
		for (var i in this.nodes) this.adj_matrix[this.num_nodes].push(0);
		originData.forEach(function(d) {
			if (d.Source==id && _this.nodes.indexOf(d.Target)>=0) {
				_this.adj_matrix[_this.num_nodes][_this.nodes.indexOf(d.Target)] = 1;
				_this.adj_matrix[_this.nodes.indexOf(d.Target)][_this.num_nodes] = 1;
			}
			else if (d.Target==id && _this.nodes.indexOf(d.Source)>=0) {
				_this.adj_matrix[_this.num_nodes][_this.nodes.indexOf(d.Source)] = 1;
				_this.adj_matrix[_this.nodes.indexOf(d.Source)][_this.num_nodes] = 1;
			}
		});
		this.adj_matrix[this.num_nodes][this.num_nodes] = 1;
		this.num_nodes++;
	}
	this.Render();
	paths.Push(id, originData);
}

Matrix.prototype.Clear = function() {
	this.num_nodes = 0;
	this.num_edges = 0;
	this.nodes = [];
	this.edges = [];
	this.Render();
}

Matrix.prototype.Render = function() {
// Define your menu
var menu = [
	{
		title: 'Item #1',
		action: function(d) {
			console.log('Item #1 clicked!');
			console.log('The data for this circle is: ' + d);
		},
		disabled: false // optional, defaults to false
	},
	{
		title: 'Item #2',
		action: function(d) {
			console.log('You have clicked the second item!');
			console.log('The data for this circle is: ' + d);
		}
	}
]

	d3.selectAll('#mat'+this.id+' > *').remove();
	var _this = this;
  	for (var i in this.nodes)
		for (var j in this.nodes) {
			if(i===j){
				this.adj_matrix[i][j] = 2;

			}
 			_this.locallayer.append('rect')
							.data([{namei:_this.nodes[i], namej:_this.nodes[j], id: _this.id, i: +i, j: +j}])
							.attr('class', 'matrix'+_this.id)
							.attr('width', this.unitsize-1)
							.attr('height', this.unitsize-1)
							.attr('x', _this.x+i*this.unitsize)
							.attr('y', _this.y+j*this.unitsize)
							.style('fill', function(d){
								if(_this.adj_matrix[d.i][d.j]==2){
									console.log("yse")
									return "white"

								}
								else if(_this.adj_matrix[d.i][d.j]==1)
								return '#cbcbcb'
								else
								return '#424242';
							})
							.on('contextmenu', function(d) {
								
								d3.event.preventDefault();

								if (d.i==d.j) {
									_this.Delete(_this.nodes[d.i]);
								}  
								else{
									_this.DeleteAll(_this.nodes);
								}  
								 
							//	d3.contextMenu(menu)
							})
							.on('mouseover', function(d) {
								d3.select(this).style('fill', 'red');
								if (d.i==d.j) {
									d3.selectAll('rect').style('fill', function(dd) {
 										if(matrix_list[dd.id].adj_matrix[dd.i][dd.j]==2){
											console.log("yse")
											return "white"
		
										}
										else if(matrix_list[dd.id].adj_matrix[dd.i][dd.j]==1)
										return '#cbcbcb'
										else
										return '#424242';
									});
									d3.select(this).style('fill', 'blue');
									d3.selectAll('path').attr('stroke', '#999');
									d3.selectAll('.path'+d.namei)
										.attr('stroke', 'blue');
									
								}
							})
							.on('mouseout', function(d) {
								if (d.i!=d.j) d3.select(this).style('fill', function(){return (_this.adj_matrix[d.i][d.j]==1)?'#cbcbcb':'#424242';});
								if (d.i==d.j) d3.select(this).style('fill', function(){return "white";});

								//if (d.i==d.j)
								//	d3.selectAll('.path'+d.namei)
								d3.selectAll('path').attr('stroke', '#999');

							}) 
							.call(d3.drag()
									.on("start", dragstarted)
									.on("drag", dragged)
									.on("end", dragended));
		}
	for (var i in this.nodes) {
		_this.locallayer.append('text')
						.attr('class', function(){return 'text'+_this.id;})
						.text(this.nodes[i])
						.style('text-anchor', 'end')
						.attr('x', this.x-5)
						.attr('y', this.y+i*this.unitsize+10)
						.style('font-size', '10px');
	}
	 
};


function dragstarted(d) {
	d3.selectAll('.matrix'+d.id).raise().classed("active", true);
}

function dragged(d) {
	var matrix = matrix_list[d.id];
	var mat = d3.selectAll('.matrix'+d.id)
	matrix.x = d3.event.x-d.i*matrix.unitsize;
	matrix.y = d3.event.y-d.j*matrix.unitsize;
	matrix.Render();
	paths.UpdateData();
	paths.Update();
	//d3.select('.').attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
	d3.select('.matrix'+d.id).classed("active", false);
	
	for (var i in matrix_list) {
		var matrix = matrix_list[i];
		var x = d3.event.x;
		var y = d3.event.y;
		if (x>matrix.x && x<matrix.x+matrix.unitsize*matrix.num_nodes && y>matrix.y && y<matrix.y+matrix.unitsize*matrix.num_nodes && i!=d.id) {
			//console.log(2);
			for (var k in matrix_list[d.id].nodes) matrix.Push(matrix_list[d.id].nodes[k]);
			matrix_list[d.id].Clear();
		}
	}
}

var matrix_list = [];
var matrix_nodes = [];
var originData;