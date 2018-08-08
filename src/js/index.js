import {
  axisBottom,
  axisRight,
  event,
  extent,
  scaleBand,
  scaleQuantize,
  scaleTime,
  select,
  timeParse,
  timeYear
} from "d3";
import "../css/index.pcss";
import { colors, months } from "./utils";
import data from "./data.json";

const margin = { top: 100, right: 60, bottom: 100, left: 20 };
const width = 1000;
const height = 400;

const { monthlyVariance, baseTemperature } = data;

const [minVariance, maxVariance] = extent(
  monthlyVariance,
  ({ variance }) => variance
);
const [minYear, maxYear] = extent(monthlyVariance, ({ year }) => year);

const barWidth = (width / monthlyVariance.length) * 12;

const yearParse = timeParse("%Y");

const xScale = scaleTime()
  .domain([yearParse(minYear), yearParse(maxYear)])
  .range([0, width])
  .nice(timeYear, 6);

const yScale = scaleBand()
  .domain(months)
  .range([0, height]);

const colorScale = scaleQuantize()
  .domain([minVariance, maxVariance])
  .range(colors);

const tooltip = select("#chart")
  .append("div")
  .attr("class", "tooltip");

const tooltipDate = tooltip
  .append("p")
  .attr("class", "tooltip--text tooltip--date");
const tooltipTemperature = tooltip
  .append("p")
  .attr("class", "tooltip--text tooltip--temperature");
const tooltipVariance = tooltip
  .append("p")
  .attr("class", "tooltip--text tooltip--variance");

const chart = select("#chart")
  .append("svg")
  .attr("class", "chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

chart
  .append("text")
  .attr("transform", `translate(${width / 2}, ${-45})`)
  .attr("class", "chart--title")
  .text("Global Temperature Variance");

chart
  .append("text")
  .attr("transform", `translate(${width / 2}, ${-20})`)
  .attr("class", "chart--description")
  .text(
    `This graph illustrates the change in global surface temperature from year ${minYear} to ${maxYear} based on average temperature of: ${baseTemperature}°C.`
  );

chart
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(axisBottom(xScale).tickValues(xScale.ticks(timeYear.every(10))));

chart
  .append("g")
  .attr("transform", `translate(${width}, 0)`)
  .call(axisRight(yScale));

chart
  .selectAll("rect")
  .data(monthlyVariance)
  .enter()
  .append("rect")
  .attr("x", ({ year }) => xScale(yearParse(year)))
  .attr("width", barWidth)
  .attr("y", ({ month }) => yScale(months[month - 1]))
  .attr("height", yScale.bandwidth())
  .attr("fill", ({ variance }) => colorScale(variance))
  .on("mouseover", ({ month, year, variance }) => {
    const temperature = (baseTemperature + variance).toFixed(3);
    tooltip
      .style("display", "block")
      .style("left", `${event.pageX - 50}px`)
      .style("top", `${event.pageY - 70}px`);

    tooltipDate.text(`${year} – ${months[month - 1]}`);
    tooltipTemperature.text(`${temperature}°C`);
    tooltipVariance.text(`${variance.toFixed(3)}`);
  })
  .on("mouseout", () => {
    tooltip.style("display", "none");
  });

const legendWidth = 20;
const legendHeight = 20;

const legendScale = scaleBand()
  .domain(colors)
  .range([0, 80]);

const centerLegend = width / 2 - (colors.length / 2) * legendWidth;

chart
  .append("g")
  .selectAll("legend--block")
  .data(colors)
  .enter()
  .append("rect")
  .attr("class", "legend--block")
  .attr("x", (d, i) => legendScale(d) + i * (legendWidth / 1.32))
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", (d, i) => colors[i])
  .attr("transform", `translate(${centerLegend}, ${height + 40})`);

chart
  .append("g")
  .selectAll("legend--text")
  .data(["colder", "warmer"])
  .enter()
  .append("text")
  .attr("class", "legend--text")
  .attr("x", (d, i) => legendWidth * colors.length * i)
  .text(d => d)
  .attr(
    "transform",
    `translate(${centerLegend - 10}, ${height + legendHeight * 4})`
  );
