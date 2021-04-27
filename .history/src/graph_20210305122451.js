function Graph(w, h, edges, nodes) {
	this.threshold = 2;
	//this.paths = paths;
	this.w = w;
	this.h = h;
	this.originNodes=nodes;
	this.orginLinks=edges;
	this.deleteNodes=[];
	this.deleteLinks=[];
	this.nodes = nodes;
	this.links = edges;
	this.weights = {};
	this.currNodes = [];
	this.currLinks = [];
	this.currNeighbors = {};
 }

function stripscript(s) {
	var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&mdash;—|{}【】‘；：”“'。，、？]")
	var rs = "";
	for (var i = 0; i < s.length; i++) {
		rs = rs + s.substr(i, 1).replace(pattern, '');
	}
	return rs;
}
Graph.prototype.create = function (edges, nodes, neighbors) {
	d3.selectAll("#networklayer").remove();
	this.layer = d3.select("#force"); 
	this.svg = d3.select("#mainsvg");
	this.layer.on('dblclick.zoom', null);//防止按键冲突，消除zoom的双击功能

	//console.log(neighbors)
	var _this = this;
	nodes.forEach(function (d) {
		_this.currNodes.push(d);
	});

	this.links.forEach(function (d) {
		_this.currLinks.push(d);
	});
	Object.keys(neighbors).forEach(function (d) {
		_this.currNeighbors[d] = neighbors[d];
	});
 	var content = this.layer.append("g")
		.attr("id", "networklayer");

	 
	content.append('defs').append('marker')   //三角形【箭头】
		.attr("id", 'arrowhead')
		.attr('viewBox', '-0 -5 10 10')
		.attr('refX', 23) // 标记点的x坐标。如果圆更大，这个也需要更大
		.attr('refY', 0)
		.attr('orient', 'auto')
		.attr('markerWidth', 13)
		.attr('markerHeight', 13)
		.attr('xoverflow', 'visible')
		.append('svg:path')
		.attr('d', 'M 0,-5 L 10 ,0 L 0,5')
		.attr('fill', '#999')
		.style('stroke', 'none')
	/*
				let nodeColorScale = d3.scaleOrdinal() // 自定义节点的颜色     =d3.scaleOrdinal(d3.schemeSet2)
					.domain(["Domain", "IP",
						"Cert_SHA256", 'IP_CidR',
						'ASN', 'Whois_Name',
						'Whois_Email', 'Whois_Phone'])
					.range(["#bc36dd", "#1070f7 ",
						"#ff5d8d", "#c8e499",
						"#c5f6fa", "#aabfc9",
						"#aabfc9", "#aabfc9"]);
		*/
	let nodeSizeScale = d3.scaleOrdinal() // 自定义节点的大小    =d3.scaleOrdinal(d3.schemeSet2)
		.domain(["Domain", "IP",
			"Cert_SHA256", 'IP_CidR',
			'ASN', 'Whois_Name',
			'Whois_Email', 'Whois_Phone'])
		.range(["23px", "23px ",
			"23px", "10px",
			"10px", "17px",
			"17px", "17px"]);

	let linkColorScale = d3.scaleOrdinal() // 自定义连边的颜色
		.domain(["ip", "r_dns_cname",
			'r_cert', 'r_cidr',
			'r_asn', "r_whois_name",
			'r_whois_email', 'r_whois_phone',
			'r_subdomain', 'r_certchain',
			'r_request_jump'])
		.range(["#1070f7"/*蓝 -强*/, "#c2e0ce "/*灰绿-一般*/,
			"#ff5d8d"/*粉红-强*/, "#c8e499"/*淡绿-弱*/,
			"#c5f6fa"/*淡蓝-弱*/, "#aabfc9"/* 蓝=较强*/,
			"#aabfc9"/*蓝-较强*/, "#aabfc9"/* 蓝--较强*/,
			"#bc36dd"/*紫-强*/, "#eebefa"/*淡紫--一般*/,
			'#38d9a9'/*湖绿-强*/]);

	//简化边名称
	let labelForShort = {
		"r_dns_a": "IP", "r_dns_cname": "CNAME",
		'r_cert': "CERT", 'r_cidr': "IP_C",
		'r_asn': "ASN", "r_whois_name": "R-Name",
		'r_whois_email': "R-Email", 'r_whois_phone': "R-Phone",
		'r_subdomain': "SubDom", 'r_cert_chain': "CA-CERT",
		'r_request_jump': "JUMP"
	};

	let imageScale = d3.scaleOrdinal() // 自定义节点的图片     =d3.scaleOrdinal(d3.schemeSet2)
		.domain(["Domain", "IP",
			'IP_CidR', "Cert_SHA256",
			'ASN', 'Whois_Name',
			'Whois_Email', 'Whois_Phone'])
		.range(["D", "IP",
			"IP/C", "cert.jpg",
			'ASN', "whois name.jpg",
			"whois email.jpg", "whois phone.jpg"]);

	let tooltip = d3.select(".tooltip"); // 选中提示框



	var brush = content.append("g")//放到content上
		.attr("class", "brush");

	//console.log(edges)
	/*----------初始化连边------------------------*/
	const link = content.selectAll(".links")
		.data(edges)
		.enter()
		.append("line")
		.attr("class", "links")
		.attr("stroke", d => linkColorScale(d.relation))
		.attr("stroke-width", "1px")
		.style("opacity", 0.8)
		.attr("id", d => "line" + d.source + d.target)
		.attr("class", "links")
		.attr('marker-end', 'url(#arrowhead)');



	/*----------------------初始化节点-----------------------------*/
	const node = content.selectAll(".nodes")
		.data(nodes)
		.enter()
		.append("g")
		.attr("id", function (d) { return "n" + d.name; })
		.attr("class", "nodes")
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
		);


	//定义节点图片
	var defs = node.append("defs");

	defs.append('pattern')//svg:pattern 添加图片
		.attr("id", function (d, i) { return "my_image" + i })
		.attr("width", 1)
		.attr("height", 1)
		.append("svg:image")
		.attr("xlink:href", function (d) {

			return imageScale(d.type)
		}
		)
		.attr("height", function (d) {
			if (d.type == "Cert_SHA256")
				return "40";
			else
				return "30";
		})
		.attr("width", function (d) {
			if (d.type == "Cert_SHA256")
				return "40";
			else
				return "30";
		})
		.attr("x", function (d) {
			if (d.type == "Cert_SHA256")
				return 2;
			else
				return 2;
		})
		.attr("y", function (d) {
			if (d.type == "Cert_SHA256")
				return 2;
			else
				return 2;
		});


	node.append("circle")
		.attr("r", d => nodeSizeScale(d.type))
		.attr("id", function (d) { return "n" + d.id; })
		.attr("stroke", "grey")
		.attr("fill", function (d, i) {
			if (d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone")
				return "url(#my_image" + i + ")";
			else
				return "white";
		})
		// 如果是wjk导出的，就是d.category;自己导出的就是d.type
		.on("mouseover", function (d) {
			tooltip.style("visibility", "visible").style("left", d3.event.pageX + "px").style("top", d3.event.pageY + "px");
			tooltip.select(".tipName").text(d.name);
			tooltip.select(".tipDomain").text(d.type);
			tooltip.select(".tipIndustry").text(d.industry);
			tooltip.select(".tipIsAlive").text(d.is_alive);
			return null;
		})
		.on("mouseout", function () {
			return tooltip.style("visibility", "hidden");
		})


	node.append("text")
		.text(function (d) {
			// 返回字母
			if (!(d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone"))
				return imageScale(d.type);
		})
		.attr("dx", -7)
		.attr("dy", function (d) {
			if (d.type == "ASN" || d.type == "IP_CidR")
				return 2;
			else
				return 8;
		})

	node.attr("font-size", function (d) {
		if (d.type == "IP_CidR" || d.type == "ASN")
			return 8;
	})
		.attr("font-weight", function (d) {
			if (d.type == "IP_CidR" || d.type == "ASN")
				return 600;
		})


	const edgepaths = content.selectAll(".edgepath") //连边上的标签位置,是的文字按照这个位置进行布局
		.data(edges)
		.enter()
		.append('path')
		.attr('class', 'edgepath')
		.attr('fill-opacity', 0)
		.attr('stroke-opacity', 0)
		.attr('id', function (d, i) { return 'edgepath' + i })
		.style("pointer-events", "none");

	const edgelabels = content.selectAll(".edgelabel")
		.data(edges)
		.enter()
		.append('text')
		.style("pointer-events", "none")
		.attr('class', 'edgelabel')
		.attr('id', function (d, i) { return 'edgelabel' + i })
		.attr('font-size', 12)
		.attr('fill', d => linkColorScale(d.relation));

	edgelabels.append('textPath') //要沿着<path>的形状呈现文本，请将文本包含在<textPath>元素中，该元素具有一个href属性，该属性具有对<path>元素的引用.
		.attr('xlink:href', function (d, i) { return '#edgepath' + i })
		.style("text-anchor", "middle")
		.style("pointer-events", "none")
		.attr("startOffset", "50%")
		.text(d => labelForShort[d.relation]);

	/*---------------------定义力导引模型----------------------*/
	let simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function (d) { return d.name }).distance(120))
		.force("charge", d3.forceManyBody().strength(-700).distanceMax(1200))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.alphaMin(0.001) //需要在 [0, 1] 之间。如果没有指定 min 则返回当前的最小 alpha 值，默认为 0.001. 在仿真内部，会不断的减小 alpha 值直到 alpha 值小于 最小 alpha。

	simulation.nodes(nodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(edges);
 
 
	function ticked() { //该函数在每次迭代force算法的时候，更新节点的位置(直接操作节点数据数组)。
		link.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

	    node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
		edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
		paths.Update();

	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fy = d.y;
		d.fx = d.x;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}
	function dragended(d) {
		if (!d3.event.active) {
			simulation.alphaTarget(0).restart();;
		}
		d.fx = null;
		d.fy = null;
	}
};

Graph.prototype.add = function (ids) {
	//console.log(ids)
	if (Object.keys(ids).length === 0) return;
	// add more nodes & links in the graph
	var n = this.currNodes;
	var l = this.currLinks;
	var ngb = this.currNeighbors;
	console.log(this.nodes)
	this.originNodes.forEach(function (d) {
		if (ids[d.id] === 1) {
			console.log(d)
			n.push(d); 
		}
		
	});
	this.currNodes = n;

 
	
	this.links.forEach(function(d) {
		if (l.indexOf(d) >= 0){
			l[l.indexOf(d)]=d;
			return;
		}
		if(ids[d.Source] == 1 || ids[d.Target] == 1) {
			console.log(d)
		}
	});
	console.log(l)
	console.log(this.links)
	graph.update(n,this.links);
	
	
 	/*
	 this.orginLinks.forEach(function(d) {
		if (l.indexOf(d) >= 0) return;
		if(ids[d.Source] == 1 || ids[d.Target] == 1) {
			l.push(d);
			ngb[d.Source].push(d.Target);
			ngb[d.Target].push(d.Source);
		}
	});
	//this.currLinks = l;
	console.log(n)
  	this.nodes.forEach(function (d) {
		if (ids[d.id] === 1) {
			n.push(d);
			if (ngb[d.id] == null) ngb[d.id] = [];
		}
		
	});
	this.links.forEach(function(d) {
		if (l.indexOf(d) >= 0) return;
		if(ids[d.Source] == 1 || ids[d.Target] == 1) {
			l.push(d);
			ngb[d.Source].push(d.Target);
			ngb[d.Target].push(d.Source);
		}
	});
	*/
  	//this.currNodes = n;
	//this.currLinks = l;
	//this.currNeighbors = ngb;
	//graph.update();
	//for (var i = paths.data.length - 1; i >= 0; i--) if (paths.data[i].force_id in ids) paths.data.splice(i, 1); //delete data that won't be used
	//paths.Render();
	/*originData.forEach(function(d) {
		var in_matrix, in_force;
		if (matrix_nodes.indexOf(d.source)>=0 && ) {
			in_matrix = d.source;
			in_force = d.target;
		}
		else if (matrix_nodes.indexOf(d.target)>=0) {
			in_matrix = d.target;
			in_force = d.source;
		}
		else return;
		
	});*/
	//paths.Create();
}

Graph.prototype.delete = function (ids) {
	if (Object.keys(ids).length === 0) return;
	// delete nodes & links in the graph
	var n = this.currNodes;
	var l = this.currLinks;
	var ngb = this.currNeighbors;//每个节点对应的邻接节点
 	this.nodes.forEach(function (d) {
		if (ids[d.id] == 1) {//ids是lasso中圈出的节点们
			  
			var idx = n.indexOf(d);
			if (idx >= -1) n.splice(idx, 1);//删除 idx位置的节点
			if (ngb[d.id] != null) ngb[d.id] = [];
		 
		}
	});
	this.links.forEach(function (d) {
		//if(!(ids[d.source] == null && ids[d.target] == null)) {
		if (ids[d.Source] == 1 || ids[d.Target] == 1) {//若与该节点相连
			if (l.includes(d)) {
				var idx = l.indexOf(d);
 				l.splice(idx, 1);
				if (ngb[d.source] != null && ngb[d.source].includes(d.target)) {
					var t = ngb[d.source].indexOf(d.target);
					 ngb[d.source].splice(t, 1);
				}
				if (ngb[d.target] != null && ngb[d.target].includes(d.source)) {
					var s = ngb[d.target].indexOf(d.source);
					 ngb[d.target].splice(s, 1);
				}
			}
		}
	});
	this.currNodes = n;
	this.currLinks = l;
	this.currNeighbors = ngb;
 
	console.log(l)
	graph.update(n,l);

	//for (var str in Object.keys(ids)) d3.select('#n'+Object.keys(ids)[str]).remove();

	for (var i = paths.data.length - 1; i >= 0; i--) if (paths.data[i].force_id in ids) paths.data.splice(i, 1); //delete data that won't be used
	paths.Render();


}

Graph.prototype.update = function (nodes,edges) {
	d3.selectAll("#networklayer > *").remove();

	//console.log(d3.selectAll("circle"));
	//d3.selectAll('circle').remove();
	//d3.selectAll('.label').remove();
	//d3.selectAll('line').remove();
 
	d3.select("#force").on('dblclick.zoom', null);//防止按键冲突，消除zoom的双击功能

 	var content = d3.select("#force").append("g")
		.attr("id", "networklayer");
 

	content.append('defs').append('marker')   //三角形【箭头】
		.attr("id", 'arrowhead')
		.attr('viewBox', '-0 -5 10 10')
		.attr('refX', 23) // 标记点的x坐标。如果圆更大，这个也需要更大
		.attr('refY', 0)
		.attr('orient', 'auto')
		.attr('markerWidth', 13)
		.attr('markerHeight', 13)
		.attr('xoverflow', 'visible')
		.append('svg:path')
		.attr('d', 'M 0,-5 L 10 ,0 L 0,5')
		.attr('fill', '#999')
		.style('stroke', 'none')
	/*
				let nodeColorScale = d3.scaleOrdinal() // 自定义节点的颜色     =d3.scaleOrdinal(d3.schemeSet2)
					.domain(["Domain", "IP",
						"Cert_SHA256", 'IP_CidR',
						'ASN', 'Whois_Name',
						'Whois_Email', 'Whois_Phone'])
					.range(["#bc36dd", "#1070f7 ",
						"#ff5d8d", "#c8e499",
						"#c5f6fa", "#aabfc9",
						"#aabfc9", "#aabfc9"]);
		*/
	let nodeSizeScale = d3.scaleOrdinal() // 自定义节点的大小    =d3.scaleOrdinal(d3.schemeSet2)
		.domain(["Domain", "IP",
			"Cert_SHA256", 'IP_CidR',
			'ASN', 'Whois_Name',
			'Whois_Email', 'Whois_Phone'])
		.range(["23px", "23px ",
			"23px", "10px",
			"10px", "17px",
			"17px", "17px"]);

	let linkColorScale = d3.scaleOrdinal() // 自定义连边的颜色
		.domain(["ip", "r_dns_cname",
			'r_cert', 'r_cidr',
			'r_asn', "r_whois_name",
			'r_whois_email', 'r_whois_phone',
			'r_subdomain', 'r_certchain',
			'r_request_jump'])
		.range(["#1070f7"/*蓝 -强*/, "#c2e0ce "/*灰绿-一般*/,
			"#ff5d8d"/*粉红-强*/, "#c8e499"/*淡绿-弱*/,
			"#c5f6fa"/*淡蓝-弱*/, "#aabfc9"/* 蓝=较强*/,
			"#aabfc9"/*蓝-较强*/, "#aabfc9"/* 蓝--较强*/,
			"#bc36dd"/*紫-强*/, "#eebefa"/*淡紫--一般*/,
			'#38d9a9'/*湖绿-强*/]);

	//简化边名称
	let labelForShort = {
		"r_dns_a": "IP", "r_dns_cname": "CNAME",
		'r_cert': "CERT", 'r_cidr': "IP_C",
		'r_asn': "ASN", "r_whois_name": "R-Name",
		'r_whois_email': "R-Email", 'r_whois_phone': "R-Phone",
		'r_subdomain': "SubDom", 'r_cert_chain': "CA-CERT",
		'r_request_jump': "JUMP"
	};

	let imageScale = d3.scaleOrdinal() // 自定义节点的图片     =d3.scaleOrdinal(d3.schemeSet2)
		.domain(["Domain", "IP",
			'IP_CidR', "Cert_SHA256",
			'ASN', 'Whois_Name',
			'Whois_Email', 'Whois_Phone'])
		.range(["D", "IP",
			"IP/C", "cert.jpg",
			'ASN', "whois name.jpg",
			"whois email.jpg", "whois phone.jpg"]);

	let tooltip = d3.select(".tooltip"); // 选中提示框



	var brush = content.append("g")//放到content上
		.attr("class", "brush");

	//console.log(edges)
	/*----------初始化连边------------------------*/
	const link = content.selectAll(".links")
		.data(edges)
		.enter()
		.append("line")
		.attr("class", "links")
		.attr("stroke", d => linkColorScale(d.relation))
		.attr("stroke-width", "1px")
		.style("opacity", 0.8)
		.attr("id", d => "line" + d.source + d.target)
		.attr("class", "links")
		.attr('marker-end', 'url(#arrowhead)');



	/*----------------------初始化节点-----------------------------*/
	const node = content.selectAll(".nodes")
		.data(nodes)
		.enter()
		.append("g")
		.attr("id", function (d) { return "n" + d.name; })
		.attr("class", "nodes")
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
		);


	//定义节点图片
	var defs = node.append("defs");

	defs.append('pattern')//svg:pattern 添加图片
		.attr("id", function (d, i) { return "my_image" + i })
		.attr("width", 1)
		.attr("height", 1)
		.append("svg:image")
		.attr("xlink:href", function (d) {

			return imageScale(d.type)
		}
		)
		.attr("height", function (d) {
			if (d.type == "Cert_SHA256")
				return "40";
			else
				return "30";
		})
		.attr("width", function (d) {
			if (d.type == "Cert_SHA256")
				return "40";
			else
				return "30";
		})
		.attr("x", function (d) {
			if (d.type == "Cert_SHA256")
				return 2;
			else
				return 2;
		})
		.attr("y", function (d) {
			if (d.type == "Cert_SHA256")
				return 2;
			else
				return 2;
		});


	node.append("circle")
		.attr("r", d => nodeSizeScale(d.type))
		.attr("id", function (d) { return "n" + d.id; })
		.attr("stroke", "grey")
		.attr("fill", function (d, i) {
			if (d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone")
				return "url(#my_image" + i + ")";
			else
				return "white";
		})
		// 如果是wjk导出的，就是d.category;自己导出的就是d.type
		.on("mouseover", function (d) {
			tooltip.style("visibility", "visible").style("left", d3.event.pageX + "px").style("top", d3.event.pageY + "px");
			tooltip.select(".tipName").text(d.name);
			tooltip.select(".tipDomain").text(d.type);
			tooltip.select(".tipIndustry").text(d.industry);
			tooltip.select(".tipIsAlive").text(d.is_alive);
			return null;
		})
		.on("mouseout", function () {
			return tooltip.style("visibility", "hidden");
		})


	node.append("text")
		.text(function (d) {
			// 返回字母
			if (!(d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone"))
				return imageScale(d.type);
		})
		.attr("dx", -7)
		.attr("dy", function (d) {
			if (d.type == "ASN" || d.type == "IP_CidR")
				return 2;
			else
				return 8;
		})

	node.attr("font-size", function (d) {
		if (d.type == "IP_CidR" || d.type == "ASN")
			return 8;
	})
		.attr("font-weight", function (d) {
			if (d.type == "IP_CidR" || d.type == "ASN")
				return 600;
		})
		const edgepaths = content.selectAll(".edgepath") //连边上的标签位置,是的文字按照这个位置进行布局
		.data(edges)
		.enter()
		.append('path')
		.attr('class', 'edgepath')
		.attr('fill-opacity', 0)
		.attr('stroke-opacity', 0)
		.attr('id', function (d, i) { return 'edgepath' + i })
		.style("pointer-events", "none");

	const edgelabels = content.selectAll(".edgelabel")
		.data(edges)
		.enter()
		.append('text')
		.style("pointer-events", "none")
		.attr('class', 'edgelabel')
		.attr('id', function (d, i) { return 'edgelabel' + i })
		.attr('font-size', 12)
		.attr('fill', d => linkColorScale(d.relation));

	edgelabels.append('textPath') //要沿着<path>的形状呈现文本，请将文本包含在<textPath>元素中，该元素具有一个href属性，该属性具有对<path>元素的引用.
		.attr('xlink:href', function (d, i) { return '#edgepath' + i })
		.style("text-anchor", "middle")
		.style("pointer-events", "none")
		.attr("startOffset", "50%")
		.text(d => labelForShort[d.relation]);


	/*---------------------定义力导引模型----------------------*/
	let simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function (d) { return d.name }).distance(120))
		.force("charge", d3.forceManyBody().strength(-700).distanceMax(1200))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.alphaMin(0.001) //需要在 [0, 1] 之间。如果没有指定 min 则返回当前的最小 alpha 值，默认为 0.001. 在仿真内部，会不断的减小 alpha 值直到 alpha 值小于 最小 alpha。

	 
	simulation.nodes(nodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(edges);

		
	function ticked() { //该函数在每次迭代force算法的时候，更新节点的位置(直接操作节点数据数组)。
		link.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

		node
			.attr("cx", function(d) { 
				paths.data.forEach(function(dd) {
					//console.log(dd);
					if (dd.force_id == d.id) {
						dd.pos_end.x = d.x;
						dd.pos_end.y = d.y;
					}
				});
				return d.x; 
			});
			node.attr("transform", d => `translate(${d.x},${d.y})`);

		edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
		paths.Update();

	} 

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fy = d.y;
		d.fx = d.x;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}
	function dragended(d) {
		if (!d3.event.active) {
			simulation.alphaTarget(0);
		}
		d.fx = null;
		d.fy = null;
		for (var i in matrix_list) {
			var matrix = matrix_list[i];
			var x = d3.event.x;
			var y = d3.event.y;
			if (x>matrix.x && x<matrix.x+matrix.unitsize*matrix.num_nodes && y>matrix.y && y<matrix.y+matrix.unitsize*matrix.num_nodes) {
				console.log(2);
				var aaa = {};
				aaa[d.id] = 1;
				_this.delete(aaa);
				matrix.Push(d.id);
			}
		}
	}
	d3.selectAll(".lasso").remove();
	d3.selectAll(".origin").remove();
	let l=new Lasso();
	l.bind();
	//var newzoom = new Zoom(d3.select("#mainsvg"), transform);

} 
function highlight(node, state, neighbors) {

	var nid =node.id;

	var c = d3.select("#n" + nid);
	var l = d3.select("#l" + nid);

	c.classed("main", state);
	l.classed("on", state);
	l.classed("main", state);

	// activate all siblings
	neighbors[node.id].forEach(
		function (id) {
			var idd =id;
			d3.select("#n" + idd).classed("sibling", state);
			d3.select("#l" + idd).classed("on", state);
			d3.select("#l" + idd).selectAll("text").classed("sibling", state);
		});
}

