// sample code for copying and pasting

// FOR STEP 1

// loading 2 files
Promise.all([
    d3.json('./data/sets.json'),
    d3.csv('./data/nodes.csv')
])

// for data parsing
let defsDict = {};
nodes.forEach(node => {
    defsDict[node.code] = node;
});


// FOR STEP 2

// Add label for each circle group
columnGroup
.append('text')
.classed('column-text', true)
.style('font-size', '10px')
.attr('transform', 'translate(-25, -25)')
.text(d => defsDict[d.column].shortName);

// FOR STEP 3
// defining color scale
let colorScale = d3.scaleOrdinal()
        .domain(['Amundsen', 'Natural Environment Reseach Council', 'Sea Data Network', '', 'Climate and Forecast'])
        .range(['#dde', '#068', '#e65', '#878', '#765']);

// adding color scale to the circles
.style('fill', d => {
    return colorScale(defsDict[d].standard);
})

// FOR STEP 4
// for hover interaction
.on('mouseenter', function(event) {
    let data = d3.select(event.target).datum();
    showTooltip(defsDict[data], event.target);
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

// FOR STEP 5
// close tooltip function
function closeTooltip() {
    d3.select('#tooltip')
        .style('display', 'none')
        .style('opacity', 0);
}
