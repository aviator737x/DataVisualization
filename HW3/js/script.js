const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928'];

// Part 1: Создать шкалы для цвета, радиуса и позиции
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation();


d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title)
        .rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data);
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);

    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    // ..

    color.domain(ratings.map(d=> d.key));
    radius.domain([d3.min(rating), d3.max(rating)]);
    x.domain([d3.min(years), d3.max(years)]);

    // Part 1 - создать circles на основе data

        // ..



    // добавляем обработчики событий mouseover и mouseout
            // .on('mouseover', overBubble)
            // .on('mouseout', outOfBubble);

    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    // ..

    simulation.nodes(data).force("center", d3.forceCenter(b_width / 2, b_height / 2))
        .force("x", d3.forceX().x(function (d) {
            return x(+d['release year']);
        }))
        .force("collide", d3.forceCollide().radius(function(d) {
            return radius(+d['user rating score']);
        }).iterations(1));

    let nodes = bubble.selectAll('circle').data(data).enter().append('circle')
        .attr('class', function (d) {
            return d['rating'];
        })
        .attr('cx', function (d) {
            return x(+d['release year']);
        }).attr('r', function (d) {
            return radius(+d['user rating score']);
        }).attr('style', function (d) {
            return 'fill: ' + color(d['rating']);
        }).on('mouseover', overBubble)
        .on('mouseout', outOfBubble);


    simulation.on('tick', function () {
        nodes.attr('cx', function (d) {
            return d.x;
        }).attr('cy', function (d) {
            return d.y;
        })
    });


    let serialGroupedByRating = d3.nest().key(d=>d.rating).entries(data)
        .map(d=> {
            let result = {};
            result.number = d.values.length;
            result.name = d.key;
            return result;
        });

    // Part 1 - Создать шаблон при помощи d3.pie() на основе ratings
    // ..
    let arcs = d3.pie()
        .value(function(d) { return d.number; })
        (serialGroupedByRating);




    
    // Part 1 - Создать генератор арок при помощи d3.arc()
    // ..
    let arc = d3.arc()
        .innerRadius(d_width / 3.5)
        .outerRadius(d_width / 2.5)
        .padAngle(0.02)
        .cornerRadius(5);
    
    // Part 1 - построить donut chart внутри donut
    // ..
    donut.selectAll('path').data(arcs)
        .enter().append('path')
        .attr('d', arc) // каждый элемент будет передан в генератор
        .attr('fill', function (d) {
            console.log(d)
            return color(d.data.name);
        })
        .style("opacity", 1);

    // добавляем обработчики событий mouseover и mouseout
    donut.selectAll('path')
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    const bubles = nodes._groups;

    function overBubble(d){
        console.log(d)
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        // ..

        for(let buble of bubles[0]) {
            if (+buble.getAttribute('cx') === +d.x && +buble.getAttribute('cy') === +d.y) {
                buble.setAttribute('stroke', 'black');
                buble.setAttribute('stroke-width', '2');
                break;
            }
        }
        
        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        // ..

        tooltip._groups[0][0].innerHTML = d['title']
            + "<br><span style=\"color: #969696; \">"
            + d['release year'] + "</span></br>";

        // Part 3 - изменить display и позицию tooltip
        // ..
        tooltip.style("visibility", "visible").style('display', "block");
        tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    }

    function outOfBubble(d){
        // Part 2 - сбросить stroke и stroke-width
        // ..

        for(let buble of bubles[0]) {
            if (+buble.getAttribute('cx') === +d.x && +buble.getAttribute('cy') === +d.y) {
                buble.removeAttribute('stroke');
                buble.removeAttribute('stroke-width');
                break;
            }
        }
            
        // Part 3 - изменить display у tooltip
        // ..
        tooltip.style("display", "none");
    }

    donut.selectAll('path').attr('id', function (d) {
        return d.data.name;
    });

    const paths = donut.selectAll('path');


    function overArc(d){
        console.log(d)
        // Part 2 - изменить содержимое donut_lable
        // ..
        donut_lable.text(d.data.name)

        // Part 2 - изменить opacity арки
        // ..

        let path = donut.select('path#' + d.data.name)._groups[0][0];
        path.setAttribute('style', 'opacity: ' + 0.5);

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        // ..
        for(let buble of bubles[0]) {
            if (buble.getAttribute('class') === d.data.name) {
                buble.setAttribute('stroke', 'black');
                buble.setAttribute('stroke-width', '2');
            } else {
                buble.setAttribute('opacity', '0.5');
            }
        }

    }
    function outOfArc(d){
        // Part 2 - изменить содержимое donut_lable
        // ..
        donut_lable.text("");
        // Part 2 - изменить opacity арки
        // ..
        let path = donut.select('path#' + d.data.name)._groups[0][0];
        path.setAttribute('style', 'opacity: ' + 1);

        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        // ..

        for(let buble of bubles[0]) {
            if (buble.getAttribute('class') === d.data.name) {
                buble.removeAttribute('stroke');
                buble.removeAttribute('stroke-width');
            } else {
                buble.setAttribute('opacity', '1');
            }
        }
    }
});