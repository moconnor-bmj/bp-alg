$(document).ready(function() {

  $(window).resize(function() {

    // set svg container width
    var mainWidth = parseInt($("main").css("width"));
    var mainLRTotalMargin = parseInt($("main").css("margin-left")) + parseInt($("main").css("margin-right"));
    var mainLRTotalPadding = parseInt($("main").css("padding-left")) + parseInt($("main").css("padding-right"));
    var svgCalcWidth = mainWidth - (mainLRTotalMargin + mainLRTotalPadding);
    $(".svg_container").width(svgCalcWidth);

    // set svg container height
    var mainHeight = parseInt($("main").css("height"));
    var mainTBTotalMargin = parseInt($("main").css("margin-top")) + parseInt($("main").css("margin-bottom"));
    var mainTBTotalPadding = parseInt($("main").css("padding-top")) + parseInt($("main").css("padding-bottom"));
    var debugContainerHeight = (function() {
      if ($(".debug-container .svg-metric").is(':visible')) {
        return parseInt($(".debug-container").css("height"));
      } else {
        return -40;
      }
    })();

    var svgCalcHeight = (mainHeight - debugContainerHeight) - (mainTBTotalMargin + mainTBTotalPadding) - 100;
    $(".svg_container").height(svgCalcHeight);

    $(".svg-metric").html("Svg Container - Width: " + svgCalcWidth + "  Height: " + debugContainerHeight);
    /*
        var vscrollVisible = (function() {
          var docHeight = $(document).height();
          var windHeight = $(window).height();
          if (docHeight <= windHeight) {
            return windHeight - docHeight;
          } else {
            //return windHeight - docHeight;
          $(".svg_container").height(windHeight-100)
              //
          }
        })();

       
    */
  });

});

// Hover events
function mouseover(d) {
  d3.select(this).select("rect.rect-children-2").classed("hover", true);
  d3.select(this).select("rect.rect-children").classed("hover", true);
  d3.select(this).select("rect.rect-text").classed("hover", true);
}

// Toggle children on click.
function mouseout(d) {
  //d3.select(this).select("text.hover").remove();
  d3.select(this).select("rect.rect-children-2").classed("hover", false);
  d3.select(this).select("rect.rect-children").classed("hover", false);
  d3.select(this).select("rect.rect-text").classed("hover", false);
}

function collapse(d) {
  if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
  }
}

function toggleAll(d) {
  if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
  }
}

function updateEvents() {
  $(".node a").on("click", function (e) {
      window.location = $(this).attr('href');
      //e.preventDefault();
      e.stopPropagation();
      //console.log("link");
  });
}

function getDepth(obj) {
  var depth = 0;
  if (obj.children) {
      obj.children.forEach(function (d) {
          var tmpDepth = getDepth(d)
          if (tmpDepth > depth) {
              depth = tmpDepth
          }
      })
  }
  return 1 + depth
}

// This is for the text wrapping in nodes & labels
function wrap(text, width) {
  text.each(function () {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.2, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = text.attr("dy") ? text.attr("dy") : 0;

      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          var centradox = x + (width - tspan.node().getComputedTextLength()) / 2;

          if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber *
                  lineHeight + dy + "em").text(word);
          }
      }
  });
}

// SEARCH & HIGHLIGHT PATH - basically a way to get the path to an object
function searchTree(obj,search,path){
  if(obj.name === search){ //if search is found return, add the object to the path and return it
    path.push(obj);
    return path;
  }
  else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
    var children = (obj.children) ? obj.children : obj._children;
    for(var i=0;i<children.length;i++){
      path.push(obj);// we assume this path is the right one
      var found = searchTree(children[i],search,path);
      if(found){// we were right, this should return the bubbled-up path from the first if statement
        return found;
      }
      else{//we were wrong, remove this parent from the path and continue iterating
        path.pop();
      }
    }
  }
  else{//not the right object, return false so it will continue to iterate in the loop
    return false;
  }
}

function extract_select2_data(node,leaves,index){
        if (node.children){
            for(var i = 0;i<node.children.length;i++){
                index = extract_select2_data(node.children[i],leaves,index)[0];
            }
        }
        else {
            leaves.push({id:++index,text:node.name});
        }
        return [index,leaves];
}

// center the letter-containers in the tag-letters container
//function centerTagLetters() {
var removeWidth = document.getElementById('condInfo').offsetWidth; // Amended to include width of col-4 (blue)
var realWidth = window.innerWidth - removeWidth;
var realHeight = window.innerHeight;

var m = [40, 240, 40, 0],
  w = realWidth - m[0] - m[0],
  h = realHeight - m[0] - m[2],
  i = 0,
  root,
  select2_data;

var tree = d3.layout.tree()
  .sort(function comparator(a, b) {
        return +b.size - +a.size;
    })
  .size([w, h])

var diagonal = d3.svg.diagonal()
  .projection(function(d) {
    return [d.x, d.y];
  });

  // SEARCH & HIGHLIGHT PATH
function openPaths(paths){
  for(var i =0;i<paths.length;i++){
    if(paths[i].id !== "1"){//i.e. not root
      paths[i].class = 'found';
      if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
        paths[i].children = paths[i]._children;
          paths[i]._children = null;
      }
      update(paths[i]);
    }
  }
}

var vis = d3.select("#box").append("svg:svg")
  .attr("class", "svg_container")
  .attr("width", w)
  .attr("height", h)
  .style("overflow", "scroll")
  .style("background-color", " #F0F8FF")
  .style("border-style", "solid")
  .style("border-color", " #EBF4FA")

.append("svg:g")
  .attr("class", "drawarea")
  .append("svg:g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var btnExpandCollapse = d3.select("#form #button");

function loadData(json) {
  root = json;
  select2_data = extract_select2_data(json,[],0)[1]; //I know, not the prettiest...
  //d3.select("#processName").html(root.text);
  
  root.x0 = h / 2;
  root.y0 = 0;
  btnExpandCollapse.on("click", function() {
    toggle(root);
    update(root);
  });
  
  root.children.forEach(collapse);
  update(root);
  
  //init search box
  $('#search').select2({
    data: select2_data,
    containerCSSclass: 'search'
  });

  // add search box listener
  $('#search').on('select2-selecting', function(e) {
		var paths = searchTree(root, e.object.text, []);
		if(typeof(paths) !== 'undefined'){
			openPaths(paths);
		}
		else{
			alert(e.object.text + 'not found!');
		}
  })
}

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();
  //console.warn(nodes)

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 125;
  });

  // Update the nodes…
  var node = vis.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("id", function (d) {
      return d.id
    })
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function(d) {
      toggle(d);
      update(d);
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  var groupText = nodeEnter.append("g")
    .attr("class", "text");
  
    groupText.append("circle")
    //.attr("r", 1e-6)
    .on("click", function(d){click(d)}) 
    .style("fill", function(d) {
        if (d.id == "1") {return "red"}
        else 	{ return "black" }
    ;})

/*          var cuadroTexto = groupText.append('foreignObject');
          cuadroTexto.attr('dx', function(d) { return 2*d.name.length} )
                .attr('y', function(d) { return d.children || d._children ? 0 : 100; })
                .on("click", click)
                .html(function(d,i) { 
              var cuadronodelinks = '<div class="box-node-links"><div class="links-node">'
              +'<a title="Ver en directorio" href="/directorio?id='+d.id+'"><i class="fa fa-list-alt"></i></a>'
              +'<a title="Ver Organigrama" href="<?php echo $_SERVER['REQUEST_URI']; ?>&parent_id_chart='+d.id+'"><i class="fa fa-sitemap"></i></a>'
              +'</div></div>';
  
              var cuadronode = '<div class="box-node-text">'
              +cuadronodelinks
              +'<div class="text-node">'
              +d.name
              +'</div></div>'; 
                  return cuadronode;
              });*/

// if you have children

groupText.append('rect')
    .on("click", function(d){click(d)}) 
    .attr("x", "-75px")
    .attr("y", "20")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", 150)
    .attr("height", 50)
    .attr("fill", "#fff")
    .attr("class", "rect-children")
    
    .style("stroke", "#777")
    .style("stroke-width", function (d) {
        var children = 0;
        if (d._children != null) {
            children = d._children.length;
        }
        return (children <= 0) ? "0px" : "0.2px";
    });

groupText.append('rect')
.on("click", function(d){click(d)}) 
    .attr("x", "-75px")
    .attr("y", "20")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", 150)
    .attr("height", 50)
    .attr("fill", "#fff")
    .attr("class", "rect-children-2")
    .style("stroke", "#777")
    //.attr("transform", "rotate(2)")
    .style("stroke-width", function (d) {
        var children = 0;
        if (d._children != null) {
            children = d._children.length;
        }
        return (children <= 0) ? "0px" : "0.2px";
    });

// We draw the box with the link bar and with the text of each department
groupText.append('rect')
    .attr("class", "bar-links")
    .attr("x", "-75px")
    .attr("y", "0")
    .attr("width", 150)
    .attr("height", 20)
    .attr("fill", "#2a6ebb")
    .attr("stroke", "#ccc")
    .attr("stroke-width", "0.2px")
    .style("fill", function(d) {
        if (d.name == "Acute") {return "#1951a4"}
    ;});

groupText.append('a')
    .attr("x", "-50px")
    .attr("y", "10")
    // .attr("xlink:href", function (d) {
    //     return '/directorio?id=' + d.id;
    // })
    // .attr("xlink:title", "Ver directorio"){"name":"root","children":[{"children":[{"id":"1","parentid":"20","name":"ACUTE PANCREATITIS (Suspected)","path":"","label":""},{"id":"2","parentid":"1","name":"Serum amylase or lipase (>3 ULN)?","path":"100,20,1","label":""},{"id":"688","parentid":"1","name":"Urgent assessment of haemodynamic status for signs of organ failure","path":"100,20,1","label":" "},{"id":"9","parentid":"2","name":"(NO Path) Consider alternative diagnosis [+ pitfall B]","path":"100,20,1,13477","label":"NO [+ pitfall] B"},{"id":"7674","parentid":"2","name":"(YES Path) Acute Pancreatitis confirmed [+ pitfall A]","path":"100,20,1,13477","label":"YES [+ pitfall] A"},{"id":"7665","parentid":"7674","name":"Risk stratify using: SIRS criteria met; Awareness of risk factors","path":"100,20,1,13477,166","label":""},{"id":"7668","parentid":"7674","name":"Order transabdominal ultrasound to check for biliary aetiology ...","path":"100,20,1,13477,166","label":"Investigations to establish aetiology"},{"id":"7885","parentid":"7665","name":"Immediate transfer to ITU if signs of organ failure. Consider ITU transfer if .....","path":"100,20,1,13477,166","label":"High risk of developing severe disease"},{"id":"7886","parentid":"7665","name":"Continue supportive care","path":"100,20,1,13477,166","label":"Low risk of developing severe disease"},{"id":"19","parentid":"9","name":"Ongoing suspicion of Acute Pancreatitis","path":"100,20,1,13477,9","label":""},{"id":"10237","parentid":"19","name":"Order CECT (or MRCP if CECT contraindicated)","path":"100,20,1,13477,9,19","label":""},{"id":"102307","parentid":"10237","name":"Imaging findings characteristic of Acute Pancreatitis","path":"100,20,1,13477,9,19","label":""},{"id":"3181","parentid":"688","name":"Child of Urgent Assessment ...","path":"100,20,1,688","label":""},{"id":"7338","parentid":"3181","name":"Grandson of Urgent Assessment ...","path":"100,20,1,688,3181","label":""},{"id":"7334","parentid":"3181","name":"Granddaughter of Urgent Assessment ...","path":"100,20,1,688,3181","label":""}]}]}
    .attr("fill", "white")
    .attr("height", 20)
    .attr("width", 150)
    .attr("font-size", 12)
    .append('text')
    .attr("font-family", "FontAwesome")
    .attr("x", "40px")
    .attr("y", "15")
    .text('\uf055');

groupText.append('a')
    .attr("x", "25px")
    .attr("y", "10")
    // .attr("xlink:href", function (d) {
    //     return window.location.href + "&parent_id_chart=" + d.id;
    // })
    // .attr("xlink:title", "Ver organigrama")
    .attr("fill", "white")
    .attr("height", 20)
    .attr("width", 150)
    .attr("font-size", 12)
    .append('text')
    .attr("font-family", "FontAwesome")
    .attr("x", "55px")
    .attr("y", "15")
    .text('\uf0ab');

groupText.append('rect')
.on("click", function(d){click(d)}) 
    .attr("x", "-75px")
    .attr("y", "20")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", 150)
    .attr("height", 50)
    .attr("fill", "white")
    .classed("rect-text", true)
    .attr("stroke", "#777")
    .attr("stroke-width", "0.2px");

groupText.append('text')
.on("click", function(d){click(d)}) 
    .text(function (d, i) {
        return d.name;
    })
    .attr("x", "0")
    .attr("text-anchor", "middle")
    .attr("y", "33")
    .attr("font-size", 12)
    .attr("fill", "#555")
    .call(wrap, 140)
    // .style("font-weight", function(d) {
    //     if (d.id == "1") {return "bold"}
    // ;});

  // nodeEnter.append("svg:circle")
  //   .attr("r", function(d) {
  //     return 5;
  //     //return Math.sqrt((d.part_cc_p * 1)) + 4;
  //   })
  //   .attr("class", function(d) {
  //     return "level" + d.part_level;
  //   })
  //   .style("stroke", function(d) {
  //     if (d._children) {
  //       return "#2a6ebb";
  //     }
  //   });

  nodeEnter.append("svg:text")
    .append("tspan")
    .text(function(d) {
      return d.id;
    })
    .attr("x", function(d) {
      return (this.getComputedTextLength() * -1)-15;
      //return d.childern || d._children ? -80 : -50;
      // return d.children || d._children ? -((Math.sqrt((d.part_cc_p * 1)) + 6) + this.getComputedTextLength()) : Math.sqrt((d.part_cc_p * 1)) + 6;
    })
    .attr("y", function(d) {
      return d.children || d._children ? -10 : -10;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) {
      //options start || end
      return d.children || d._children ? "start" : "start"; 
    })
    .style("fill-opacity", 1);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  nodeUpdate.select("circle")
    .attr("r", function(d) {
      return 5;
      //return Math.sqrt((d.part_cc_p * 1)) + 4;
    })
    .attr("class", function(d) {
      return "level" + d.part_level;
    })
    .style("stroke", function(d) {
      if (d._children) {
        return "blue";
      } else {
        return null;
      }
    })
    .style("fill", function(d) {
      if(d.class === "found"){
        return "#ff4136"; //red
      }
      else if(d._children){
        return "green";
      }
      else{
        return "red";
      }
    })
    .style("stroke", function(d) {
      if(d.class === "found"){
        return "#ff4136"; //red
      }
  });

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  // nodeExit.select("circle")
  //   .attr("r", function(d) {
  //     return 10;
  //     //return Math.sqrt((d.part_cc_p * 1)) + 4;
  //   });

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
    .data(tree.links(nodes), function(d) {
      return d.target.id;
    });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal)
    .style("stroke",function(d){
      if(d.target.class==="found"){
        return "#ff4136";
      }
    });

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  d3.select("svg")
    .call(d3.behavior.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", zoom));

}

//recursively collapse children
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}


// Toggle children.
function toggle(d) {
  $(".node-metric").html("User Clicked Node > " + d.name);
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }

}

function zoom() {
  var scale = d3.event.scale,
    translation = d3.event.translate,
    tbound = -h * scale,
    bbound = h * scale,
    lbound = (-w + m[1]) * scale,
    rbound = (w - m[3]) * scale;
  // limit translation to thresholds
  translation = [
    Math.max(Math.min(translation[0], rbound), lbound),
    Math.max(Math.min(translation[1], bbound), tbound)
  ];
  d3.select(".drawarea")
    .attr("transform", "translate(" + translation + ")" +
      " scale(" + scale + ")");
}

// loadData({
//   name: "root",
//   children: [
//     {
//       name: "child one",
//       children: [
//        {name: "grand child 1", children: [
//           {name: "great grand child 1", children: [
//             {name: "great great grand child 1", children: []},
//             {name: "great great grand child 2", children: []}
//           ]},
//           {name: "great grand child 2", children: [
//             {name: "great great grand child 3", children: []},
//             {name: "great great grand child 4", children: []}
//           ]}
//        ]},
//        {name: "grand child 2", children: [
//           {name: "great grand child 3", children: []},
//           {name: "great grand child 4", children: []}
//        ]}
//       ]
//    },
//    {
//      name: "child two",
//      id: 3,
//      children: [
//       {name: "grand child 3", children: [
//           {name: "great grand child 5", children: []},
//           {name: "great grand child 6", children: []}
//       ]},
//       {name: "grand child 4", id: 7, children: [
//           {name: "great grand child 7", children: []},
//           {name: "great grand child 8", children: []}
//       ]}
//      ]
//    }
//   ]
// });
//}

loadData({
  "name": "Acute Pancreatitis (SUSPECTED)",
  "children": [
    { "name": "Serum amylase or lipase (>3 ULN)?", "children": [
      { "name": "(NO Path) Consider alternative diagnosis [+ pitfall B]", "children": [
        { "name": "Ongoing suspicion (despite negative test results)", "children": [
          { "name": "Order CECT (or MRCP if CECT contraindicated)", "children": [
            { "name": "Imaging findings characteristic of Acute Pancreatitis" }] }
        ]},
      ]}, 
      { "name": "(YES Path) Acute Pancreatitis confirmed [+ pitfall A]", "children": [
        { "name": "Risk stratify using: SIRS criteria met; Awareness of risk factors", "children": [
          { "name": "Immediate transfer to ITU if signs of organ failure ..." },
          { "name": "Continue supportive care" }
        ] },
        { "name": "Order transabdominal ultrasound to check for biliary aetiology ..." }
      ]}
    ]
  }, 
    { "name": "Urgent assessment of haemodynamic status for signs of organ failure", "children": [
      { "name": "F", "children": [
        { "name": "F1" },
        { "name": "F2" }
      ]
    }, 
    { "name": "G", "children": [
      { "name": "K", "children": [
        { "name": "K1" }
      ]}, 
      { "name": "L", "children": [
        { "name": "L1" }
      ]}
    ] }
  ]
  }]
});
