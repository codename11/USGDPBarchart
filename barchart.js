let result = null;
$(document).ready(() => {

    let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    $.ajax({
        url: url, 
        success: (response) => {

            result = JSON.parse(response);

            // Dimensions of chart.
            const w = 800;
            const h = 600;

            //Margin to be set between chart and outher container.
            const m = { top: 40, right: 40, bottom: 40, left: 40 };

            //How many bars are. Number of element in array are the number of bars.
            let barsQuantity = result.data.length;

            //Calculating bar width. Width of chart divided by how many bars are. Result is width for individual bar.
            let barWidth = w / barsQuantity;

            //Getting data.
            let dataset = [...result.data];
            
            //Getting quarter.
            for(let i=0;i<result.data.length;i++){

                let month = result.data[i][0].substring(result.data[i][0].length-5, result.data[i][0].length-3);
                let q = null;

                if(parseInt(month) <= 3){
                    q = "Q1";
                }

                if(parseInt(month) <= 6 && parseInt(month)>3){
                    q = "Q2";
                }

                if(parseInt(month) <= 9 && parseInt(month)>6 && parseInt(month)>3){
                    q = "Q3";
                }

                if(parseInt(month) <= 12 && parseInt(month)>9 && parseInt(month)>6 && parseInt(month)>3){
                    q = "Q4";
                }
                dataset[i].push(q);

            }
            
            //Calculating smallest and highest value for gdp part of dataset.
            let minVal = d3.min(dataset, (d) => d[1]);
            let maxVal = d3.max(dataset, (d) => d[1]);
            
            //Drawing chart in element in html document and adding appropriate margin.
            const svg = d3.select("#demo").append("svg")
                .attr("width", w + m.left + m.right)
                .attr("height", h + m.top + m.bottom);

            //Translating axises to accomodate for margin.If we don't, ticks and numbers would look cut of.
            const g = svg.append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");

            //Setting y axis.
            let yScale = d3.scaleLinear()
            .range([h, 0])//Actual y axis length.
            .domain([0, maxVal]);//Setting values from zero to max value on y axis.
            
            //Drawing y axis.
            let yAxis = d3.axisLeft(yScale);

            //Getting actual (only)year parts from dataset.
            let years = dataset.map(year => {
                return new Date(year[0]);
            });
            
            //Calculating year.
            let minYear = new Date(d3.min(years));//Calculating first year in dataset.
            let maxYear = new Date(d3.max(years));//Calculating last year in dataset.
            maxYear.setMonth(maxYear.getMonth() + 3);//Compensating for discrapancy.

            //Setting x axis.
            let xScale = d3.scaleTime()
                    .range([0, w])//Actual x axis length.
                    .domain([minYear, maxYear]);//Setting values from zero to max year on x axis.

            //Drawing y axis.
            const xAxis = d3.axisBottom(xScale);
            
            //Appending x axis to chart.
            g.append("g")
                .attr("transform", "translate(0," + h + ")")
                .attr("class", "tick axis")
                .attr("id", "x-axis")
                .call(xAxis);

            //Appending y axis to chart.
            g.append("g")
                .attr("transform", "translate(0, 0)")
                .attr("class", "tick axis")
                .attr("id", "y-axis")
                .attr("fill", "red")
                .call(yAxis);

            //Creating tooltip element.
            const tooltip = d3.select('#demo')
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0);

            //Creating bar/s.
            g.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", (d,i) => {
                    /*Setting x coordinate by multiplying index of dataset with bar width.
                     Bars set up'd this way are next to each other, w/o padding or margin.*/
                    return (i*barWidth);
                })
                .attr("y", (d,i) => { 
                    /*Setting y coordinate by calculating the difference 
                    between max height availiable and height of the particular bar.
                    Height of the particular bar is calculated by dividing value 
                    for particular bar from dataset with maximum value from dataset.
                    For last value, we are getting result of 1(one). That means last one is occupaying
                    whole height. In other, it means, it gets zero spaces avaliable from top.*/
                    let percent = d[1] / maxVal;
                    return (h - (h * percent));
                })
                .attr("height", (d,i) => { 
                    /*Height is calculated by dividing particular bar value with maximum value.
                    In this, value calculated presents as percentage of maximum avaliable.
                    Last value divided by max values results in 1(one). Which implies that that
                    particular bar occupies whole height. To finally return value needed for height,
                    percentage is multiplied with height variable which returns 
                    actual height value for particular bar.*/
                    let percent = d[1] / maxVal;
                    return h*percent;
                })
                .attr("width", (d,i) => { 
                    //Setting bar width previosly calculated. It is the same foor each bar.
                    return barWidth;
                })
                .attr("data-date", (d,i) => {
                    //Setting data-date attribute with value.
                    return d[0];
                })
                .attr("data-gdp", (d,i) => {
                    //Setting data-gdp attribute with value.
                    return d[1];
                })
                //Setting tooltip made from absolutely positioned div.
                .on('mouseover', (d, i) => {
                    tooltip.style('opacity', 0.5);
                    tooltip.html("<div style='margin-bottom: 5px;'>"+d[0]+" "+d[2]+"</div>$"+d[1]+" Billion");
                    tooltip.attr("data-date", d[0]);
                })
                .on('mouseout', (d) => {
                    tooltip.style('opacity', 0);
                })
                .attr("class", "bar");

            //Draw the GDP Label:
            svg.append("text")
                .attr("id", "title")
                .attr("class", "headline")
                .attr("x", w / 2)
                .attr("y", m.top)
                .attr("font-family", "sans-serif")
                .attr("fill", "green")
                .attr("text-anchor", "middle")
                .text("United States GDP"); 
                
            //Draw the GDP side Label:
            svg.append("text")
                .attr("class", "headline1")
                .attr("x", w / 3.6)
                .attr("y", h / 2.4)
                .attr("transform", "translate(-180,530) rotate(-90)")
                .attr("font-family", "sans-serif")
                .attr("fill", "green")
                .attr("text-anchor", "middle")
                .text("Gross Domestic Product");  
            
        },
        error: (xhr, ajaxOptions, thrownError) => {

            console.log(xhr, ajaxOptions, thrownError);
            
        }

    });

});