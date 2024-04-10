import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ width, height, filter, value}) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBar();
  }, [value]);

  const fetchBar = async () => {
    try {
      const flag = "country"; // Or any other value you want to pass
      const response = await fetch(`/influential_pestle/${filter.toLowerCase()}/${value}`);
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
    svg.selectAll('*').remove();
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const radius = Math.min(innerWidth, innerHeight) / 2;
    const centerX = innerWidth / 2 + margin.left;
    const centerY = innerHeight / 2 + margin.top;

    const angleSlice = (Math.PI * 2) / data.length;

    // Create scales
    const rScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.num_articles)]) // Use num_articles for the radius scale
      .range([0, radius]);

    // Create the radar chart paths
    const line = d3.lineRadial()
      .angle((d, i) => i * angleSlice)
      .radius(d => rScale(d.num_articles)) // Adjusted to use num_articles for radius
      .curve(d3.curveLinearClosed);

    const radarLine = svg.selectAll('.radarLine')
      .data([data])
      .enter().append('g')
      .attr('class', 'radarLine');

    radarLine.append('path')
      .attr('class', 'radarPath')
      .attr('d', d => line(d))
      .attr('transform', `translate(${centerX},${centerY}) rotate(90)`)
      .style('fill', 'none')
      .style('stroke', 'steelblue')
      .style('stroke-width', '2px');

    // Create axes
    const axisGrid = svg.append('g')
      .attr('class', 'axisWrapper');

    // Draw the radar chart axes
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleSlice;
      axisGrid.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX + Math.cos(angle) * radius)
        .attr('y2', centerY + Math.sin(angle) * radius)
        .attr('class', 'axisLine')
        .style('stroke', 'gray')
        .style('stroke-width', '1px');

        axisGrid.append('text')
        .attr('x', centerX + Math.cos(angle) * (radius + 10)) // Adjust label position
        .attr('y', centerY + Math.sin(angle) * (radius + 10)) // Adjust label position
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(data[i].pestle);
    }

  }, [data, width, height]);
  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
};

export default RadarChart;
