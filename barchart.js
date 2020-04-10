let res = null;
$(document).ready(() => {

    let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    $.ajax({
        url: url, 
        success: (response) => {

            res = JSON.parse(response);

            let dataset = [];

            for(let i=0;i<res.data.length;i++){

                let year = res.data[i][0];
                let month = res.data[i][0].substring(res.data[i][0].length-5, res.data[i][0].length-3);
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
                dataset.push([res.data[i][1],year,q]);

            }

            const w = 800;
            const h = 600;

            //set the margins
            const m = { top: 40, right: 40, bottom: 40, left: 40 };

            const svg = d3.select("#demo").append("svg")
                .attr("width", w + m.left + m.right)//Sirina i visina celokupnog svg elementa.
                .attr("height", h + m.top + m.bottom);

            //Pozicioniranje samog chart-a unutar svg-a.
            const g = svg.append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");

            // the xScale for the bar chart will be a band scale
            /*range je duzina linije po x osi koja se gleda od sirine svg-a.
            domain su vrednosti koje se automatski nalaze kada se indeksi dataset-a
            uzmu kao parametar. Zatim se indeksi pravilno rasporede po sirini(width-w), tj. range-u.*/
            let xScale = d3.scaleBand()
                    .range([0, w])
                    //Since the domain is about the index of the values, the domain must be an array of the indices for the x-axis scale
                    .domain(dataset.map( (d,i) => { 

                        return i; 

                    }));

            //for the y-axis scale since it is a linear scale you just mention the array extent as the domain
            /*Kod y ose je slicno, ali malo drugacije. U domain-u umesto indeksa, 
            prikazuju se istoimene vrednosti, a range je visina(h) po kome se redjaju vrednosti.*/
            let yScale = d3.scaleLinear()
                    .range([h, 0])
                    .domain([0, dataset[dataset.length-1][0]]);

            // draw the axis
            let xScale1 = d3.scaleBand()
                    .range([0, w])
                    //Since the domain is about the index of the values, the domain must be an array of the indices for the x-axis scale
                    .domain(dataset.map( (d,i) => { 

                        return d[1].substr(0, 4); 

                    })); 

            let ind = null;
            const xAxis = d3.axisBottom(xScale1).tickFormat((d,i) => {
                
                if(parseInt(d) === 1950){
                    ind = i;
                    return d;
                }

                if(ind+5===i){
                    ind = i;
                    return d;
                }
                
            }); //X axis

            g.append("g")
                .attr("transform", "translate(0," + h + ")")
                .attr("class", "tick axis")
                .attr("id", "x-axis")
                .call(xAxis);

            const yAxis = d3.axisLeft(yScale); //Y axis
            g.append("g")
                .attr("transform", "translate(0, 0)")//Ako se pravilno setuje u yScale, onda se ovde ne mora raditi translacija.
                .attr("class", "tick axis")
                .attr("id", "y-axis")
                .call(yAxis);

            /*Dakle x osa je width i po njoj se redjaju indeksi,
            y osa je height i po njoj se redjaju vrednosti od gore pomenutih indeksa.*/
            /*
            Kada se sve izracuna  u xAxis i yAxis, onda se prosledjuje 
            kao parametar za x i y koordinatu bar-a.
            */

            //draw the rectangles
            g.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("id",(d,i) => {
                    return "tipX"+i
                })
                .attr("x", (d, i) => {//d je vrednost iz niza.
                    return xScale(i);//koordinate za tik, odnosno sredinu pojedinacnog bar-a.
                }) //the displacement along the x is dependendant on the index and the xScale
                .attr("y", (d) => { 
                    return yScale(d[0]);//Proracunata vrednost displejsmenta od vrha. 
                }) //the displacement along the y is dependant on the value and the yScale
                .attr("height", (d) => { 
                    return h - yScale(d[0]); //Proracun visine pojedinacnog bara.
                }) //the height is the difference between the displacement down and the height of the chart h
                .attr("width", xScale.bandwidth()) //Proracun sirine el. bez padinga. //the width of the rectangles is dependant on the bandwidth
                .attr("data-date", (d,i) => {
                    return d[1];
                })
                .attr("data-gdp", (d,i) => {
                    return d[0];
                })
                .attr("class", "bar")
                .append("title")
                .attr("data-date", (d,i) => {
                    return d[1];
                })
                .attr("id", "tooltip")
                .text((item, i) => {
                    
                    return item[1].substr(0, 4)+" "+item[2]+" \n$"+item[0]+" Billion";
                    
                });
                
            //Draw the GDP Label:
            svg.append("text")
                .attr("id", "title")
                .attr("class", "headline")
                .attr("x", w / 2) //positions it at the middle of the width
                .attr("y", m.top) //positions it from the top by the margin top
                .attr("font-family", "sans-serif")
                .attr("fill", "green")
                .attr("text-anchor", "middle")
                .text("United States GDP"); 
                
            //Draw the GDP side Label:
            svg.append("text")
                .attr("class", "headline1")
                .attr("x", w / 3.6) //positions it at the middle of the width
                .attr("y", h / 2.4) //positions it from the top by the margin top
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
