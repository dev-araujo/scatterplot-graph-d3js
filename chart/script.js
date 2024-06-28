import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

const drawGraph = (data, selector) => {
  d3.select(selector).selectAll("*").remove();

  const width = 800;
  const height = 500;
  const padding = 60;

  const svg = d3.select(selector).attr("width", width).attr("height", height);

  const xScale = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => new Date(d.Year, 0, 1)),
      d3.max(data, (d) => new Date(d.Year, 0, 1)),
    ])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => new Date(d.Seconds * 1000)),
      d3.max(data, (d) => new Date(d.Seconds * 1000)),
    ])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(new Date(d.Year, 0, 1)))
    .attr("cy", (d) => yScale(new Date(d.Seconds * 1000)))
    .attr("r", 5)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => new Date(d.Seconds * 1000))
    .attr("fill", (d) => (d.Doping ? "red" : "green"))
    .on("mouseover", (event, d) => {
      tooltip.transition().style("visibility", "visible");
      tooltip
        .html(
          `
        <strong>${d.Name}</strong><br>
        Year: ${d.Year}, Time: ${d.Time}<br>
        ${d.Doping ? d.Doping : "No Allegations"}
      `
        )
        .attr("data-year", d.Year)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().style("visibility", "hidden");
    });

  const legend = d3.select("#legend");
  legend
    .append("div")
    .html(`<span style="color:red;">●</span> Doping Allegations`);
  legend
    .append("div")
    .html(`<span style="color:green;">●</span> No Allegations`);
};

async function getData() {
  const api_url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
  const response = await fetch(api_url);
  const data = await response.json();

  drawGraph(data, "#chart");
}

getData();
