let res = null;
$(document).ready(() => {

    let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    $.ajax({
        url: url, 
        success: (response) => {

            res = JSON.parse(response);

            let values = [];
            let dates = [];
            let quarter = [];

            for(let i=0;i<res.data.length;i++){

                let year = parseInt(res.data[i][0].substr(0, 4));
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

                values.push(res.data[i][1]);
                dates.push(year);
                quarter.push([q]);

            }
            values.sort((a, b) => {return a - b});

            const w = 800;
            const h = 600;

            //set the margins
            const m = { top: 40, right: 40, bottom: 40, left: 40 };

            const svg = d3.select("body").append("svg")
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
                    .domain(dates.map( (d,i) => { 

                        return i; 

                    }));

            //for the y-axis scale since it is a linear scale you just mention the array extent as the domain
            /*Kod y ose je slicno, ali malo drugacije. U domain-u umesto indeksa, 
            prikazuju se istoimene vrednosti, a range je visina(h) po kome se redjaju vrednosti.*/
            let yScale = d3.scaleLinear()
                    .range([h, 0])
                    .domain([0, values[values.length-1]]);

            // draw the axis
            let xScale1 = d3.scaleBand()
                    .range([0, w])
                    //Since the domain is about the index of the values, the domain must be an array of the indices for the x-axis scale
                    .domain(dates.map( (d,i) => { 

                        return d; 

                    })); 

            let ind = null;
            const xAxis = d3.axisBottom(xScale1).tickFormat((d,i) => {
                
                if(d === 1950){
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
                .attr("class", "axis")
                .call(xAxis);

            const yAxis = d3.axisLeft(yScale); //Y axis
            g.append("g")
                .attr("transform", "translate(0, 0)")//Ako se pravilno setuje u yScale, onda se ovde ne mora raditi translacija.
                .attr("class", "axis")
                .call(yAxis);

            /*Dakle x osa je width i po njoj se redjaju indeksi,
            y osa je height i po njoj se redjaju vrednosti od gore pomenutih indeksa.*/
            /*
            Kada se sve izracuna  u xAxis i yAxis, onda se prosledjuje 
            kao parametar za x i y koordinatu bar-a.
            */

            let rect = [];

            //draw the rectangles
            g.selectAll("rect")
                .data(values)
                .enter()
                .append("rect")
                .attr("x", (d, i) => {//d je vrednost iz niza.
                    return xScale(i);//koordinate za tik, odnosno sredinu pojedinacnog bar-a.
                }) //the displacement along the x is dependendant on the index and the xScale
                .attr("y", (d) => { 
                    return yScale(d);//Proracunata vrednost displejsmenta od vrha. 
                }) //the displacement along the y is dependant on the value and the yScale
                .attr("height", (d) => { 
                    return h - yScale(d); //Proracun visine pojedinacnog bara.
                }) //the height is the difference between the displacement down and the height of the chart h
                .attr("width", xScale.bandwidth()) //Proracun sirine el. bez padinga. //the width of the rectangles is dependant on the bandwidth
                .attr("class", "bar")
                .append("title")
                .text((item, i) => {
                    rect.push({
                        value: item,
                        index: i,
                        w: w,
                        h: h,
                        xScale: xScale(i),
                        yScale: yScale(item),
                        elemWidth: xScale.bandwidth(),
                        elemHeight: h - yScale(item),
                    });
                    
                    return item;
                    
                });

                //console.log(rect);

            //Draw the  Chart Label:
            svg.append("text")
                .attr("class", "headline")
                .attr("x", w / 2) //positions it at the middle of the width
                .attr("y", m.top) //positions it from the top by the margin top
                .attr("font-family", "sans-serif")
                .attr("fill", "green")
                .attr("text-anchor", "middle")
                .text("United States GDP");


        },
        error: (xhr, ajaxOptions, thrownError) => {

            console.log(xhr, ajaxOptions, thrownError);
            
        }

    });

});
