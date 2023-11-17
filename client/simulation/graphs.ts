// import * as d3 from 'd3'
import { Stats } from './models'
//https://d3-graph-gallery.com/graph/barplot_ordered.html
// export function drawBarPlot(data: Stats[]) {
//   // set the dimensions and margins of the graph
//   var margin = { top: 30, right: 30, bottom: 70, left: 60 },
//     width = 460 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom

//   // append the svg object to the body of the page
//   var svg = d3
//     .select('#my_dataviz')
//     .append('svg')
//     .attr('width', width + margin.left + margin.right)
//     .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

//   // Parse the Data
//   d3.csv(
//     'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv',
//     function (data: Array<{ name: string; stats: Stats }>) {
//       // sort data
//       data.sort(function (b, a) {
//         return a.stats.successRate - b.stats.successRate
//       })

//       // X axis
//       var x = d3
//         .scaleBand()
//         .range([0, width])
//         .domain(
//           data.map(function (d) {
//             return d.name
//           }),
//         )
//         .padding(0.2)
//       svg
//         .append('g')
//         .attr('transform', 'translate(0,' + height + ')')
//         .call(d3.axisBottom(x))
//         .selectAll('text')
//         .attr('transform', 'translate(-10,0)rotate(-45)')
//         .style('text-anchor', 'end')

//       // Add Y axis
//       var y = d3.scaleLinear().domain([0, 13000]).range([height, 0])
//       svg.append('g').call(d3.axisLeft(y))

//       // Bars
//       svg
//         .selectAll('mybar')
//         .data(data)
//         .enter()
//         .append('rect')
//         .attr('x', function (d) {
//           return x(d.name)
//         })
//         .attr('y', function (d) {
//           return y(d.stats.successRate)
//         })
//         .attr('width', x.bandwidth())
//         .attr('height', function (d) {
//           return height - y(d.stats.successRate)
//         })
//         .attr('fill', '#69b3a2')
//     },
//   )
// }

interface BarData {
  stats: Stats
  name: string
}

export function createBarPlot(data: BarData[]) {
  // Set up the dimensions of the chart
  const width = 600
  const height = 400
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  // Create the SVG container
  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Set up the scales
  const xScale = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.name))
    .range([0, width])
    .padding(0.1)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.stats.successRate)!]) // Ensure the result is not undefined
    .range([height, 0])

  // Create bars
  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.name)!)
    .attr('width', xScale.bandwidth())
    .attr('y', (d) => yScale(d.stats.successRate))
    .attr('height', (d) => height - yScale(d.stats.successRate))

  // Add X axis
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale))

  // Add Y axis
  svg.append('g').call(d3.axisLeft(yScale))

  // Add labels
  svg
    .selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d) => xScale(d.name)! + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(d.stats.successRate) - 5)
    .attr('text-anchor', 'middle')
    .text((d) => d.stats.successRate.toFixed(2))
}

// Example usage
const data: BarData[] = [
  { name: 'Category A', stats: { comptime: 10, traveledDistance: 20, pushover: 5, successRate: 0.8 } },
  { name: 'Category B', stats: { comptime: 15, traveledDistance: 25, pushover: 8, successRate: 0.6 } },
  // Add more data as needed
]
