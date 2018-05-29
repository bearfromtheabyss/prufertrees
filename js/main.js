/*Window settings*/
var viewporth = document.documentElement.clientHeight;
var viewportw = document.documentElement.clientWidth;
var leftPanelWidth = document.getElementById('menu').clientWidth;
var divWidth = (viewportw - leftPanelWidth) - 25;
document.getElementById('graphDiv').setAttribute("style", "height: " + (viewporth - 1) + "px;width:" + divWidth + "px;");
/*Graph*/
var graph = Viva.Graph.graph();
var count = 0;
var first, second;
var nodeID = 0;
var linksIds = [];
var clicks = 0;
var noNodes = 0;
var found = false;
var addNewNode = function () {
    graph.forEachNode(function (node) {
        noNodes++;
    });
    count++;
    graph.addNode(count);
}
var findMinNotInSeq = function (seq, list) {
    var min = 0;
    var notinlist = [];
    notinlist = list.filter(e=>!seq.includes(e));
    min = Math.min(...notinlist);
    return min;
}
var generateTreeFromPrufer = function () {
    var sequence = prompt("Please provide prufer sequence: ");
    var seqArray = sequence.split(",");
    var list = [];
    var tree = [];
    var found = false;
    //clear area
    graph.forEachNode(function (node) {
        graph.removeNode(node.id);
    });
    //generate labels array
    for (var i = 1; i <= seqArray.length + 2; i++) {
        list.push(i.toString());
    }
    for(var i = 0; i<list.length; i++){
        var min = findMinNotInSeq(seqArray, list);
        list = list.filter(function(e){
            return e!=min;
        });
        var node = seqArray.shift();
        graph.addLink(min, node);
    }
    //nodes left
    for(var i = 0; i < list.length; i++){
        var min = findMinNotInSeq(seqArray, list);
        if(seqArray.length == 0 && list.length > 0){
            graph.addLink(list[0], list[1]);
            break;
        }
        else{
            graph.addLink(seqArray.shift(), min);
            list = list.filter(function(e){
                return e!=min;
            });
        }
    }
}
var getPruferLabel = function (minimal) {
    if (typeof minimal != "undefined") {
        if (minimal.id != minimal.links[0].toId) {
            pruferLabel = minimal.links[0].toId;
        }
        else {
            pruferLabel = minimal.links[0].fromId;
        }
    }
    return pruferLabel;
}
var getPruferCode = function () {
    var links = [];
    var nodes = [];
    var pruferCode = [];
    graph.forEachLink(function (link) {
        links.push([link.fromId, link.toId]);
    });
    graph.forEachNode(function (node) {
        nodes.push(node);
    });
    if (links.length == 0) {
        alert("There is no links!");
    }
    else if (nodes.length - 1 != links.length) {
        alert("This is not a tree!");
    }
    else {
        var pruferCode = [];
        var minimalNode = null;

        while (nodes.length > nodes.length - 2) {
            var pruferLabel = 0;
            //get node with minimal label and 1 neighbour
            var minimal = nodes.find(function (node) {
                if (node.links.length == 1) {
                    return Math.min(node.id);
                }
            });
            //delete link with minimal
            //delete node
            if (typeof minimal != "undefined") {
                pruferLabel = getPruferLabel(minimal);
                pruferCode.push(pruferLabel);
                nodes = nodes.filter(function (node) {
                    return node.id != minimal.id;
                });
            }
            else {
                break;
            }

        }
        alert("Prufer code for this tree is: " + pruferCode.join(" , "));
    }
}

var graphics = Viva.Graph.View.svgGraphics(), nodeSize = 24;

graphics.node(
    function (node) {
        var color = '#004297';
        var ui = Viva.Graph.svg('g'),
            svgText = Viva.Graph
                .svg('text')
                .attr('y', "-" + nodeSize / 2 + "px")
                .attr('x', nodeSize / 4 + "px")
                .attr('height', nodeSize + 10)
                .attr('width', nodeSize + 10)
                .text(node.id),
            nodeLayout = Viva.Graph.svg('rect').attr('width', nodeSize).attr('height', nodeSize).attr('fill', color);
        $(ui).hover(function () {
            nodeLayout.attr('fill', 'deepskyblue');
        }, function () {
            nodeLayout.attr('fill', color);
        });
        $(ui).dblclick(function () {
            graph.removeNode(node.id);
        })
        $(ui).mousedown(function () {
            if (clicks % 2 == 0) {
                first = node.id;
            }
            else {
                second = node.id
                graph.addLink(first, second);
            }
            clicks++;
        })
        ui.append(svgText);
        ui.append(nodeLayout);

        return ui;
    }
).placeNode(
    function (nodeUI, pos) {
        nodeUI.attr('transform', 'translate(' + (pos.x - nodeSize / 2)
            + ',' + (pos.y - nodeSize / 2) + ')');
    });

graphics.link(function (link) {
    return Viva.Graph.svg('path')
        .attr('stroke', 'black')
        .attr('stroke-linecap', 'square');
}).placeLink(function (linkUI, fromPos, toPos) {
    var data = 'M' + fromPos.x + ',' + fromPos.y +
        'L' + toPos.x + ',' + toPos.y;
    linkUI.attr("d", data);
})

var layout = Viva.Graph.Layout.forceDirected(graph, {
    springLength: 50,
    springCoeff: 0.005,
    dragCoeff: 0.02,
    gravity: -0.5
});

var renderer = Viva.Graph.View.renderer(graph, {
    // layout: layout,
    container: document.getElementById('graphDiv'),
    graphics: graphics
});
renderer.run();