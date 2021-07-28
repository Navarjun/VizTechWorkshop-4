
let width = window.innerWidth;
let height = window.innerHeight;

let svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);
let container = svg.append('g');

// loading 2 files
Promise.all([
    d3.json('./data/sets.json'),
    d3.csv('./data/nodes.csv')
])
.then(function ([data, nodes]) {
    console.log(data, nodes);

    // Creating a dictionary (map in some languages)
    // for all of the definitions to be easily accessible
    let defsDict = {};
    nodes.forEach(node => {
        defsDict[node.code] = node;
    });

    // Defining a force that brings all bubbles to the center
    let centerForce = d3.forceCenter()
        .x(width/2)
        .y(height/2)
        .strength(1);

    // Defining the force simulation
    // with 2 forces
    // center and collision (which stops all bubbles from being in the same space)
    let simulation = d3.forceSimulation(data) // binding the force simulation to the data
        .force('center', centerForce)
        .force('collide', d3.forceCollide().radius(50));
    
    // Defining the color scale
    let colorScale = d3.scaleOrdinal()
        .domain(['Amundsen', 'Natural Environment Reseach Council', 'Sea Data Network', '', 'Climate and Forecast'])
        .range(['#dde', '#068', '#e65', '#878', '#765']);

    // Adding column groups which will contain all the bubbles for each column
    let columnGroup = container.selectAll('g.column-group')
        .data(data)
        .enter()
        .append('g')
        .classed('column-group', true);

    // adding circles for each column
    columnGroup
        .append('circle')
        .classed('column-circle', true)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 50);

    // adding semantically similar names
    // using the same data
    columnGroup
        .selectAll('circle.same')
        .data(d => d.sameAs) // using the nested data for nested bubbles
        .enter()
        .append('circle')
        .classed('same', true)
        .attr('transform', (d, i) => `translate(${findPosition(i)})`)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 10)
        .style('fill', d => colorScale(defsDict[d].standard))
        .on('mouseenter', function(event) {
            let data = d3.select(event.target).datum();
            showTooltip(defsDict[data], event.target);
        });;

    // Add label for each circle group
    columnGroup
        .append('text')
        .classed('column-text', true)
        .style('font-size', '10px')
        .attr('transform', 'translate(-25, -25)')
        .text(d => defsDict[d.column].shortName);

    // for every frame on the screen
    // simulation will tick
    simulation.on('tick', () => {
        columnGroup
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

});

// showTooltip function
function showTooltip(defs, svgElement) {
    // creating a string to display in the tooltip
    let content = `
        <strong>code:</strong> ${defs.code} <br/>
        <strong>convention:</strong> ${defs.standard} <br/>
        <strong>definition:</strong> ${defs.definition}
    `;

    if (defs.link) {
        content += `<br/> <a target='_blank' href='${defs.link}'>more details</a>`;
    }

    // getting the position of the circle to
    // decide the position of the tooltip
    let rect = svgElement.getBoundingClientRect();

    // setting up the tooltip
    d3.select('#tooltip')
        .html(content)
        .style('display', 'block')
        .style('opacity', 1)
        .style('top', (rect.top+10)+'px')
        .style('left', (rect.left+10)+'px');
}

// calculating the positions
function findPosition(index) {
    let angle = index * 50; // degrees
    angle = angle * (Math.PI/180); // convert to radians

    // in pixels
    // a simple guassian function
    let distance = index * 4 * Math.pow(6, 1/index);

    // using basic trigonometry
    let x = - Math.sin(angle) * distance;
    let y = Math.cos(angle) * distance;

    return [x, y];
}