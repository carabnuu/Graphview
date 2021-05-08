function Matrix(x, y) {
	this.id = matrix_list.length;
	this.num_nodes = 0;
	this.num_edges = 0;
	this.nodes = [];//保存所有节点的id
	this.edges = [];
	this.re_nodes = [];//选择后的node所有属性信息
	this.re_links = [];
	this.matrix = new Array(this.id);//选择后的node的坐标信息
	this.adj_matrix = [];
	this.value = "";
	this.x = x;
	this.y = y;
	this.locallayer = d3.select('.matrixlayer')
		.append('g')
		.attr('id', 'mat' + this.id)

	//this.paths = paths;
}

Matrix.prototype.type = 'matrix';
Matrix.prototype.unitsize = 10;
Matrix.prototype.fontsize = 15;

//Matrix.prototype.insert
Matrix.prototype.Create = function (node) {
	var _this = this;
	//this.data = data;
	//var zoom = new Zoom(d3.select('#mainsvg'), _this.locallayer, trans);
	for (var i in node) {
		this.nodes.push(node[i]);
		matrix_nodes.push(node[i]);
	}
	this.num_nodes = node.length;
	var nodegroup = ["Domain", "IP",
		"Cert_SHA256", 'IP_CIDR',
		'ASN', 'Whois_Name',
		'Whois_Email', 'Whois_Phone'];
	let linkgroup = ["ip", "r_dns_cname",
		'r_cert', 'r_cidr',
		'r_asn', "r_whois_name",
		'r_whois_email', 'r_whois_phone',
		'r_subdomain', 'r_certchain',
		'r_request_jump', 'r_dns_a']
	var n = this.num_nodes;
	var _this = this;
	var tempmatrix = [];
	var k = 0;

	d3.select('.matrixlayer')
		.call(d3.zoom().scaleExtent([-5, 2])
			// .filter(() => d3.event.button && !d3.event.ctrlKey) //平移的时候要按着ctrl
			.on('zoom', zoom_action)); // 添加平移和缩放功能

	/*---------------------自定义函数，用于图形缩放和力导引模型-------------*/
	function zoom_action() {   // 控制图形的平移和缩放
		d3.select('.matrixlayer').select("g").attr('transform', d3.event.transform)
	}



	//点信息
	originNode.forEach(function (d, i) {
		if (node.indexOf(d.id) >= 0) {
			_this.re_nodes.push({
				name: d.name,
				group: nodegroup.indexOf(d.type),
				count: 0
			});
			tempmatrix[k] = d3.range(n).map(function (j) { return { x: j, y: k, z: 10, id: d.id, type: d.type }; });
			k++;
		}
	})

	this.matrix = tempmatrix;
	_this.re_nodes.forEach(function (d, i) {
		d.index = i;
		node[i] = d.name;
	})
	//边信息 
	for (var i in node) {
		this.adj_matrix.push([]);
		for (var j in node) {
			this.adj_matrix[i].push(0)
		}
		this.adj_matrix[i][i] = -1;
	}
	originData.forEach(function (d, i) {
		if ((node.indexOf(d.Source) >= 0) && (node.indexOf(d.Target) >= 0)) {
			d.group = linkgroup.indexOf(d.relation);
			if (d.group == -1) {
			}
			var target = d.Target;
			var source = d.Source;
			_this.re_nodes.forEach(function (d) {
				if (d.name == target || d.name == source) {
					d.count += 1;
				}
			})
			_this.edges.push(d);
			_this.adj_matrix[node.indexOf(d.Target)][node.indexOf(d.Source)] = d.group;
			_this.num_edges = _this.num_edges + 1;
		}
	});
	//console.log(this.adj_matrix)
	_this.re_links.forEach(function (d, i) {
		d.source.index = node.indexOf(d.source.id);
		d.target.index = node.indexOf(d.target.id);
	})

 
	matrix_list.push(this);
	this.Render();
	// if (paths.created) {
	// 	for (var i in node) paths.Push(stripscript(node[i]));
	// 	//console.log("yse")
	// } 
}
Matrix.prototype.Reorder = function (isClick) {
	var re_nodes = this.re_nodes;
	var re_links = this.re_links;
	var transid = this.id;
	var n = this.adj_matrix.length;
	var initial_x = this.x;//矩阵的初始位置 
	var initial_y = this.y;
	var unitsize = this.unitsize;
	var matrix = this.matrix;
	var _this = this;

	if (isClick == true) {//需要进行重排
		d3.select("#order").on("change", function () {
			//	order(this.value);
			var matrixgraph = reorder.graph()
				.nodes(re_nodes)
				.links(re_links)
				.init();

			var dist_adjacency;

			var leafOrder = reorder.optimal_leaf_order()
				.distance(reorder.distance.manhattan);


			function computeLeaforder() {
				var order = leafOrder(_this.adj_matrix);

				order.forEach(function (lo, i) {
					re_nodes[i].leafOrder = lo;
				});
				return re_nodes.map(function (n) { return n.leafOrder; });
			}
			function computeLeaforderDist() {
				if (!dist_adjacency)
					dist_adjacency = reorder.graph2valuemats(matrixgraph);
				var order = reorder.valuemats_reorder(dist_adjacency,
					leafOrder);
				order.forEach(function (lo, i) {
					re_nodes[i].leafOrderDist = lo;
				});
				return re_nodes.map(function (n) { return n.leafOrderDist; });

			}
			function computeBarycenter() {
				var barycenter = reorder.barycenter_order(matrixgraph),
					improved = reorder.adjacent_exchange(matrixgraph,
						barycenter[0],
						barycenter[1]);

				improved[0].forEach(function (lo, i) {
					re_nodes[i].barycenter = lo;
				});

				return re_nodes.map(function (n) { return n.barycenter; });
			}

			function computeRCM() {
				var rcm = reorder.reverse_cuthill_mckee_order(matrixgraph);
				rcm.forEach(function (lo, i) {
					re_nodes[i].rcm = lo;
				});

				return re_nodes.map(function (n) { return n.rcm; });
			}

			function computeSpectral() {
				var spectral = reorder.spectral_order(matrixgraph);

				spectral.forEach(function (lo, i) {
					re_nodes[i].spectral = lo;
				});

				return re_nodes.map(function (n) { return n.spectral; });
			}

			// Precompute the orders.
			var orders = {
				name: d3.range(n).sort(function (a, b) { return d3.ascending(re_nodes[a].name, re_nodes[b].name); }),
				count: d3.range(n).sort(function (a, b) {

					return re_nodes[b].count - re_nodes[a].count;
				}),
				group: d3.range(n).sort(function (a, b) {
					var x = re_nodes[b].group - re_nodes[a].group;
					return (x != 0) ? x : d3.ascending(re_nodes[a].name, re_nodes[b].name);
				}),
				leafOrder: computeLeaforder,
				leafOrderDist: computeLeaforderDist,
				barycenter: computeBarycenter,
				rcm: computeRCM,
				spectral: computeSpectral
			};
			// The default sort order. 

			var currentOrder = 'name';

			function order(value) {
				var o = orders[value];
				currentOrder = value;
				var y = d3.scaleBand().domain(d3.range(n)).range([initial_y, initial_y + unitsize * n]);
				var x = d3.scaleBand().domain(d3.range(n)).range([initial_x, initial_x + unitsize * n]);

				if (typeof o === "function") {
					orders[value] = o.call();
				}
				y.domain(orders[value]);
				x.domain(orders[value]);
				console.log(orders[value])
				var t = d3.selectAll("#mat" + transid).transition().duration(1500);

				t.selectAll(".row")
					.delay(function (d, i) { return y(i) * 2; })
					.attr("transform", function (d, i) {


						return "translate(0," + y(i) + ")";
					})
					.selectAll(".cell")
					.delay(function (d) {
						return x(d.x) * 2;
					})
					.attr("x", function (d) {
						return x(d.x);
					});

				t.selectAll(".column")
					.delay(function (d, i) { return x(i) * 2; })
					.attr("transform", function (d, i) { return "translate(" + x(i) + "," + initial_y + ")rotate(-90)"; });


				// t.selectAll(".column")
				// 	.delay(function (d, i) { return x(i) * 4; })
				// 	.attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
			}

			function distance(value) {
				leafOrder.distance(reorder.distance[value]);

				if (currentOrder == 'leafOrder') {
					orders.leafOrder = computeLeaforder;
					order("leafOrder");
					//d3.select("#order").property("selectedIndex", 3);
				}
				else if (currentOrder == 'leafOrderDist') {
					orders.leafOrderDist = computeLeaforderDist;
					order("leafOrderDist");
					//d3.select("#order").property("selectedIndex", 4);
				}

				// leafOrder.forEach(function(lo, i) {
				// 	    nodes[lo].leafOrder = i;
				// 	});
				// 	orders.leafOrder = d3.range(n).sort(function(a, b) {
				// 	    return nodes[b].leafOrder - nodes[a].leafOrder; });
			}

			order(this.value);
			distance("manhattan")

		});
	}


}
Matrix.prototype.Delete = function (id) { //delete id from one matrix
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
	graph.add(aaa);
}
Matrix.prototype.DeleteAll = function (nodes) { //delete id from one matrix
	for (var k = 0; k < nodes.length; k++) {
		let id = nodes[k];
		this.num_nodes--;
		paths.Delete(id);
		var aaa = {};
		aaa[id] = 1;
		graph.add(aaa);
	}
	this.Clear();
}
Matrix.prototype.Push = function (id) {
	var _this = this;
	var num = this.nodes.indexOf(id);
	if (num < 0) {
		for (var i in this.nodes) this.adj_matrix[i].push(0);
		this.nodes.push(id);
		this.adj_matrix.push([]);
		for (var i in this.nodes) this.adj_matrix[this.num_nodes].push(0);
		originData.forEach(function (d) {
			if (d.Source == id && _this.nodes.indexOf(d.Target) >= 0) {
				_this.adj_matrix[_this.num_nodes][_this.nodes.indexOf(d.Target)] = 1;

			}
			else if (d.Target == id && _this.nodes.indexOf(d.Source) >= 0) {
				_this.adj_matrix[_this.nodes.indexOf(d.Source)][_this.num_nodes] = 1;

			}
		});
		this.adj_matrix[this.num_nodes][this.num_nodes] = 1;
		this.num_nodes++;
	}
	this.Render();
	//	paths.Push(id, originData);
}

Matrix.prototype.Clear = function () {
	this.num_nodes = 0;
	this.num_edges = 0;
	this.nodes = [];
	this.edges = [];
	d3.selectAll("#mat" + this.id).remove();
	this.Render();
}

Matrix.prototype.Render = function () {
	let nodeColorScale = d3.scaleOrdinal() // 自定义节点的大小    =d3.scaleOrdinal(d3.schemeSet2)
		.domain(["Domain", "IP",
			"Cert_SHA256", 'IP_CIDR',
			'ASN', 'Whois_Name',
			'Whois_Email', 'Whois_Phone'])
		.range(["#bc36dd", "#1070f7 ",
			"#ff5d8d", "#c8e499",
			"#c5f6fa", "#aabfc9",
			"#aabfc9", "#aabfc9"]);


	d3.selectAll(".matrixlayer >*").remove();
	d3.select(".matrixlayer").append("g").attr("id", "mat" + this.id); var x = d3.scaleBand().range([this.x, this.x + this.unitsize * this.adj_matrix.length]);
	var c = ["#1070f7"/*蓝 -强*/, "#c2e0ce "/*灰绿-一般*/,
		"#ff5d8d"/*粉红-强*/, "#c8e499"/*淡绿-弱*/,
		"#c5f6fa"/*淡蓝-弱*/, "#aabfc9"/* 蓝=较强*/,
		"#aabfc9"/*蓝-较强*/, "#aabfc9"/* 蓝--较强*/,
		"#bc36dd"/*紫-强*/, "#eebefa"/*淡紫--一般*/,
		'#38d9a9'/*湖绿-强*/, "#1070f7"];
	var z = d3.scaleLinear().domain([0, 4]).clamp(true);
	var mwidth = this.num_nodes * this.unitsize;
	var mheight = mwidth;
	var _this = this;
 
	x.domain(d3.range(_this.num_nodes));

	var row = d3.select('#mat' + this.id)
		.selectAll(".row")
		.data(this.matrix)
		.enter().append("g")
		.attr("id", function (d, i) { return "row" + i; })
		.attr("class", "row")
		.attr("transform", function (d, i) {
			var yposition = _this.y + i * _this.unitsize;
			return "translate(0," + yposition + ")";
		})
		.each(row)
		.call(d3.drag()
			.on("drag", dragged)
			.on("end", dragended))



	row.append("text")
		.attr("x", this.x)
		.attr("dx", -6)
		.attr("y", x.bandwidth() / 2)
		.attr("text-anchor", "end")
		.style('font-size', '10px')
		.text(function (d, i) { return _this.re_nodes[i].name; });

	var column = d3.select('#mat' + this.id)
		.selectAll(".column")
		.data(this.matrix)
		.enter().append("g")
		.attr("id", function (d, i) { return "col" + i; })
		.attr("class", "column")
		.attr("transform", function (d, i) {
			var yposition = _this.x + i * _this.unitsize;
			return "translate(" + yposition + "," + _this.y + ")rotate(-90)";
		});

	column.append("line")
		.attr("x1", -mwidth)
		.attr("stroke", "#fff");

	column.append("text")
		.attr("y", x.bandwidth() / 2)
		.attr("dx", 6)
		.style('font-size', '10px')
		.attr("text-anchor", "start")
		.text(function (d, i) {
			return _this.re_nodes[i].name;
		});

	function row(row) {
		var cell = d3.select(this).selectAll(".cell")
			.data(row.filter(function (d) {
				return d.z;
			}))
			.enter().append("rect")
			.attr("class", "cell")
			.attr("x", function (d) {
				return x(d.x);
			})
			.attr("width", _this.unitsize)
			.attr("height", _this.unitsize)
			.style("fill", function (d) {
				if (_this.adj_matrix[d.x][d.y] == -1)
					return nodeColorScale(d.type)
				return _this.adj_matrix[d.x][d.y] == 0 ? "#fff" : c[_this.adj_matrix[d.x][d.y]]
			})
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
		// .on('contextmenu', function (d) {
		//  	_this.DeleteAll(_this.nodes);

		// 	//	d3.contextMenu(menu)
		// })
	}

	function mouseover(p) {
		d3.selectAll("#mat" + _this.id + " .row text").classed("active", function (d, i) {
			return i == p.y;
		});
		d3.selectAll("#mat" + _this.id + " .column text").classed("active", function (d, i) { return i == p.x; });
		//d3.select(this).insert("title").text(nodes[p.y].name + "--" + nodes[p.x].name);
		d3.select(this.parentElement)
			.append("rect")
			.attr("class", "highlight")
			.attr("x", _this.x)
			.attr("width", mwidth)
			.attr("height", _this.unitsize);
		d3.select("#mat" + _this.id + " #col" + p.x)
			.append("rect")
			.attr("class", "highlight")
			.style("fill-opacity", "1")
			.attr("x", -mwidth)
			.attr("width", mwidth)
			.attr("height", _this.unitsize);
		d3.selectAll('path').attr('stroke', '#999');
		d3.selectAll('.path' + p.id)
			.attr('stroke', 'blue');
	}

	function mouseout(p) {
		d3.selectAll("text").classed("active", false);
		d3.select(this).select("title").remove();
		d3.selectAll(".highlight").remove();
		d3.selectAll('path').attr('stroke', '#999');

	}


	function dragged(d) {
		var matrix = matrix_list[_this.id];
		var mat = d3.selectAll('.matrix' + _this.id)

		matrix.x = d3.event.x
		matrix.y = d3.event.y
		matrix.Render();
		paths.UpdateData();
		paths.Update();
		//d3.select('.').attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	}

	function dragended(d) {
		d3.select('.matrix' + _this.id).classed("active", false);

		for (var i in matrix_list) {
			var matrix = matrix_list[i];
			var x = d3.event.x;
			var y = d3.event.y;
			if (x > matrix.x && x < matrix.x + matrix.unitsize * matrix.num_nodes && y > matrix.y && y < matrix.y + matrix.unitsize * matrix.num_nodes && i != _this.id) {
				//console.log(2);
				for (var k in matrix_list[_this.id].nodes) matrix.Push(matrix_list[_this.id].nodes[k]);
				matrix_list[_this.id].Clear();
			}
		}
	}
	var isClick = false;
	var tempid = this.id;
	d3.selectAll("#mat" + this.id)
		.on("click", function () {
			if (isClick == false) {
				d3.selectAll("#mat" + tempid + " text")
					.attr("fill", "red")
				isClick = true;
			}
			else {
				isClick = false;
				d3.selectAll("#mat" + tempid + " text")
					.attr("fill", "black")
			}
			var matrix = matrix_list[tempid];
			matrix.Reorder(isClick);

		})

};



var matrix_list = [];
var matrix_nodes = [];
var originData;
var originNode;