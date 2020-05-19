const graphDivId = 'flowlog-graph';

function prepareGraph() {
    fetch('graph.json')
        .then((response) => {
            if (response.ok)
                return response.json();
            else
                console.log(response);
        }).then(({ nodes, edges }) => {
            const container = document.getElementById(graphDivId);
            const options = {
                nodes: {
                    shape: "dot",
                    scaling: {
                        customScalingFunction: function(min, max, total, value) {
                            return value / total;
                        },
                        min: 5,
                        max: 150
                    }
                }
            };

            const data = {
                nodes: nodes.map(node => ({ id: node, label: node })),
                edges: edges.map(({ src, dst, count }) => ({
                    from: src,
                    to: dst,
                    value: count
                }))
            };

            const network = new vis.Network(container, data, options);
            setTimeout(() => network.setOptions({ physics: { enabled: false } }), 2000);
        })
        .catch(err => console.error(err));
}

window.addEventListener('load', () => prepareGraph());