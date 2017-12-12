import "../css/index.css";
import data from "./data.json";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const colors = [
    "#313695",
    "#4575b4",
    "#74add1",
    "#abd9e9",
    "#e0f3f8",
    "#ffffbf",
    "#fee090",
    "#fdae61",
    "#f46d43",
    "#d73027",
    "#a50026",
];
const margin = { top: 100, right: 60, bottom: 100, left: 20 };
const width = 1000;
const height = 400;

const { monthlyVariance, baseTemperature } = data;

const [minVariance, maxVariance] = d3.extent(monthlyVariance, ({ variance }) => variance);
const [minYear, maxYear] = d3.extent(monthlyVariance, ({ year }) => year);

const barWidth = width / monthlyVariance.length * /* normalize */ 12;

const yearParse = d3.timeParse("%Y");

const xScale = d3
    .scaleTime()
    .domain([yearParse(minYear), yearParse(maxYear)])
    .range([0, width])
    .nice(d3.timeYear, /* normalize */ 6);

const yScale = d3
    .scaleBand()
    .domain(months)
    .range([0, height]);

const colorScale = d3
    .scaleQuantize()
    .domain([minVariance, maxVariance])
    .range(colors);

const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");

const tooltipDate = tooltip.append("p").attr("class", "tooltip--date");
const tooltipTemperature = tooltip.append("p").attr("class", "tooltip--temperature");
const tooltipVariance = tooltip.append("p").attr("class", "tooltip--variance");

const chart = d3
    .select("body")
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
        `This graph illustrates the change in global surface temperature from year ${minYear} to ${maxYear} based on average temperature of: ${baseTemperature}°C.`,
    );

chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickValues(xScale.ticks(d3.timeYear.every(10))));

chart
    .append("g")
    .attr("transform", `translate(${width}, 0)`)
    .call(d3.axisRight(yScale));

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
            .style("left", `${d3.event.pageX - /* offset */ 50}px`)
            .style("top", `${d3.event.pageY - /* offset */ 70}px`);

        tooltipDate.text(`${year} – ${months[month - 1]}`);
        tooltipTemperature.text(`${temperature}°C`);
        tooltipVariance.text(`${variance.toFixed(3)}`);
    })
    .on("mouseout", () => {
        tooltip.style("display", "none");
    });

const legendWidth = 20;
const legendHeight = 20;

const legendScale = d3
    .scaleBand()
    .domain(colors)
    .range([0, 80]);

const centerLegend = width / 2 - colors.length / 2 * legendWidth;
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
    .attr("transform", `translate(${centerLegend}, ${height + 40})`); // Offset
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
        `translate(${centerLegend - 10}, ${height + legendHeight * 4})`, // Offset
    );
