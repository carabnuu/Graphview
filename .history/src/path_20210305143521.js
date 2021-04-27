function Paths() {
	this.data = [];
	this.num = 0;
	this.created = false;
}

Paths.prototype.outDist = 20;
	
Paths.prototype.Create = function() {
	this.created = true;
	this.data = [];
	this.num = 0;
	var _this = this;
	this.locallayer = d3.select('#path');
	//this.matrix_list = matrix_list;
	//var zoom = new Zoom(d3.select('#mainsvg'), _this.locallayer, trans);
	originData.forEach(function(d) {	
		var in_matrix, in_force;
		if (matrix_nodes.indexOf(d.Source)>=0) {
			in_matrix = d.Source;
			in_force = d.Target;
		}
		else if (matrix_nodes.indexOf(d.Target)>=0) {
			in_matrix = d.Target;
			in_force = d.Source;
		}
		else return;
		console.log(in_force);
		var node = d3.selectAll('#n'+in_force);
		console.log(node);

		if (node.empty()) return;
		//console.log(node.attr(''));
		var matrix;
		var num;
		
		for (var i in matrix_list) if (matrix_list[i].nodes.indexOf(in_matrix) >= 0) {
			//console.log(d3.selectAll(function() {return '.matrix'+i;}));
			matrix = matrix_list[i];
			//console.log(matrix);
			num = matrix_list[i].nodes.indexOf(in_matrix);
			break;
		}
			
		_this.data.push({
			r: node.attr('r'),
			x: matrix.x,
			y: matrix.y,
			matrix_id: in_matrix,
			force_id: in_force,
			center: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos0: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y},
			pos1: {x: matrix.x, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos2: {x: matrix.x+matrix.num_nodes*matrix.unitsize, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos3: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y+matrix.num_nodes*matrix.unitsize},
			pos_end: {x: 0, y: 0},
		})
		_this.num++;
	});
	this.Render();
	//console.log(_this.data);
}

Paths.prototype.UpdateData = function() {
	this.data.forEach(function(d) { //rearrange
		var matrix;
		var num;
		for (var i in matrix_list) if (matrix_list[i].nodes.indexOf(d.matrix_id) >= 0) { //find the matrix and num
			matrix = matrix_list[i];
			num = matrix_list[i].nodes.indexOf(d.matrix_id);
			break;
		}
		d.x = matrix.x;
		d.y = matrix.y;
		d.pos0.x = matrix.x+num*matrix.unitsize+matrix.unitsize/2;
		d.pos0.y = matrix.y;
		d.pos1.x = matrix.x;
		d.pos1.y = matrix.y+num*matrix.unitsize+matrix.unitsize/2;
		d.pos2.x = matrix.x+matrix.num_nodes*matrix.unitsize;
		d.pos2.y = matrix.y+num*matrix.unitsize+matrix.unitsize/2;
		d.pos3.x = matrix.x+num*matrix.unitsize+matrix.unitsize/2
		d.pos3.y = matrix.y+matrix.num_nodes*matrix.unitsize;
	});
}

Paths.prototype.Delete = function(id) {
	var _this = this;
	this.locallayer.selectAll('.path'+id).remove();
	for (var i=this.data.length-1;i>=0;i--) if (this.data[i].matrix_id == id) this.data.splice(i, 1); //delete data that won't be used
	this.UpdateData();
	this.Update();
}
Paths.prototype.DeleteAll= function() {
	var _this = this;
	this.locallayer.selectAll('.path'+id).remove();
	for (var i=this.data.length-1;i>=0;i--) if (this.data[i].matrix_id == id) this.data.splice(i, 1); //delete data that won't be used
	this.UpdateData();
	this.Update();
}
Paths.prototype.Push = function(id) {//从matrix来
	this.UpdateData();
	var _this = this;
	var matrix;
	var num;
	for (var i in matrix_list) if (matrix_list[i].nodes.indexOf(id) >= 0) { //find the matrix and num
		matrix = matrix_list[i];
		num = matrix_list[i].nodes.indexOf(id);
		break;
	}
	//console.log(originData)
 	originData.forEach(function(d) {
		var in_matrix, in_force;
		if (d.Source == id) {
			in_matrix = id;
			in_force = d.Target;
		}
		else if (d.Target == id) {
			in_matrix = id;
			in_force = d.Source;
		}
		else return;
		var node = d3.select('#n'+in_force);
 		//console.log(node)
		if (node.empty()) return;
		_this.data.push({
			r: node.attr('r'),
			x: matrix.x,
			y: matrix.y,
			matrix_id: in_matrix,
			force_id: in_force,
			center: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos0: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y},
			pos1: {x: matrix.x, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos2: {x: matrix.x+matrix.num_nodes*matrix.unitsize, y: matrix.y+num*matrix.unitsize+matrix.unitsize/2},
			pos3: {x: matrix.x+num*matrix.unitsize+matrix.unitsize/2, y: matrix.y+matrix.num_nodes*matrix.unitsize},
			pos_end: {x: 0, y: 0},
		})
		//console.log(_this.data[_this.data.length-1]);
		_this.num++;
	});
	this.Render();
}

Paths.prototype.generate = function(d) {
	var _this = this;
	var result = [];
	result.push([d.pos_end.x, d.pos_end.y]);
	var xx = d.pos2.x;
	var yy = d.pos3.y;
	//decide the point to use
	//console.log(_this.x)
	if (d.pos_end.x <= d.x && d.pos_end.y <= yy) { //left
	//console.log(1);
		result.push([d.pos1.x-_this.outDist, d.pos1.y]);
		result.push([d.pos1.x, d.pos1.y]);
	}
	else if (d.pos_end.x >= xx && d.pos_end.y >= d.y) { //right
	//console.log(2);
		result.push([d.pos2.x+_this.outDist, d.pos2.y]);
		result.push([d.pos2.x, d.pos2.y]);
	}
	else if (d.pos_end.x >= d.x && d.pos_end.y <= d.y) { //up
		//console.log(3);
		result.push([d.pos0.x, d.pos0.y-_this.outDist]);
		result.push([d.pos0.x, d.pos0.y]);
	}
	else if (d.pos_end.x <= xx && d.pos_end.y >= yy) { //down
	//console.log(4);
		result.push([d.pos3.x, d.pos3.y+_this.outDist]);
		result.push([d.pos3.x, d.pos3.y]);
	}
	if (result.length<3) {
		//console.log(d);
		return result;
	}
	//console.log(result[1]);
	//console.log(d);
	var dis = Math.sqrt((result[0][0] - result[1][0]) * (result[0][0] - result[1][0]) + (result[0][1] - result[1][1]) * (result[0][1] - result[1][1]));
	result[0][0] = result[0][0]+((d.r*1.1)/dis)*(result[1][0]-result[0][0]);
	result[0][1] = result[0][1]+((d.r*1.1)/dis)*(result[1][1]-result[0][1]);
	
	//console.log(result);
	return result;
}
	
Paths.prototype.Render = function() {
	
	this.locallayer.selectAll('#paths').remove();
 	var _this = this;
	//console.log(_this.data);
	var line = d3.line()
				.x(function(d) {return d[0];})
				.y(function(d) {return d[1];})
				.curve(d3.curveBasis);
   	
 	this.locallayer.selectAll('#paths')
					.data(_this.data)
					.enter()
					.append('path')
					.attr('class', function(d) {return 'path'+d.matrix_id;})
					.attr("id",'paths')
					.attr('d', function(d) {return line(_this.generate(d));})
					.attr('stroke', '#999')
					.attr('stroke-width', 3)
					.attr('fill', 'none')
					.attr('stroke-opacity', 0.6);

}

Paths.prototype.Update = function() {
	var _this = this;
	var line = d3.line()
				.x(function(d) {return d[0];})
				.y(function(d) {return d[1];})
				.curve(d3.curveBasis);
	this.locallayer.selectAll('#paths')
					.attr('d', function(d) {
						console.log(d)
						return line(_this.generate(d));});
 			};

var paths = new Paths();
var data=[];