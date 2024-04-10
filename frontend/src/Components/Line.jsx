import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const LineGraph = ({ width, height }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLineData();
  }, []);

  const fetchLineData = async () => {
    try {
      const flag = "country"; // Or any other value you want to pass
      const response = await fetch(`/countries/${flag}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);

    // Clear previous contents
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1]) //line.map(d => d.country)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([innerHeight, 0]);

    // Define the line function
    const lineFunc = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.frequency));

    // Append the path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', lineFunc)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Append x-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},${innerHeight + margin.top})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 30)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Index');

    // Append y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Frequency');
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      {error && <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">{error}</text>}
    </svg>
  );
};

export default LineGraph;