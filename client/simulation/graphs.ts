import { Stats } from './models'

interface BarData {
  stats: Stats
  name: string
}

export function createBarPlot(data: BarData[]) {
  // Set up the dimensions of the chart
  const width = 600
  const height = 400
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  document.querySelector('#my_data>svg')?.remove()
  // Create the SVG container
  // @ts-ignore
  const svg = d3
    .select('#my_data')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Set up the scales
  // @ts-ignore
  const xScale = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.name))
    .range([0, width])
    .padding(0.1)
  // @ts-ignore
  const yScale = d3
    .scaleLinear()
    // @ts-ignore
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
  // @ts-ignore
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale))

  // Add Y axis
  // @ts-ignore
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
