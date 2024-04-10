import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ width, height }) => {
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
  
    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.country.length)])
      .range([0, innerWidth]);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([innerHeight, 0]);
  
    // Create scatter plot
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.country.length) + margin.left)
      .attr('cy', d => yScale(d.frequency) + margin.top)
      .attr('r', 5)
      .attr('fill', 'steelblue');
  
    // Append text labels for country names
svg.selectAll('text')
  .data(data)
  .enter()
  .append('text')
  .text(d => d.country)
  .attr('x', (d, i) => i * 20 + margin.left) // Adjust the positioning along the x-axis
  .attr('y', innerHeight + margin.top + 20) // Adjust the positioning along the y-axis
  .attr('font-size', '10px')
  .attr('fill', 'black');

  
    // Append x-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${innerHeight + margin.top})`)
      .call(d3.axisBottom(xScale));
  
    // Append y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(d3.axisLeft(yScale));
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
};

export default ScatterPlot;
