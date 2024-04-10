import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const WorldMap = ({ width, height, filter}) => {
  const svgRef = useRef();
  const [world, setWorld] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorld(filter);
  }, [filter]);

  const fetchWorld = async (filter) => {
    try {
      const flag = "country"; // Or any other value you want to pass
      console.log(filter);
      const response = await fetch(`/countries/${flag}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setWorld(jsonData);
      console.log(jsonData);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (world.length === 0) return;

    const svg = d3.select(svgRef.current);

    // Set up dimensions
    const margin = { top: 10, right: 10, bottom: 1, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous contents
    svg.selectAll('*').remove();

    // Load world map data
    d3.json('/world').then(mapData => {
      const projection = d3.geoMercator()
        .fitSize([chartWidth, chartHeight], topojson.feature(mapData, mapData.objects.countries));

      const path = d3.geoPath().projection(projection);

      // Draw world map
      svg.append('g')
        .selectAll('path')
        .data(topojson.feature(mapData, mapData.objects.countries).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('stroke', 'white')
        .attr('fill', 'lightgray');

      // Add bubbles for countries
      svg.selectAll('circle')
        .data(world)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr('r', d => Math.sqrt(d.frequency) * 2)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.7);

      // Add labels for countries
      // svg.selectAll('text')
      //   .data(world)
      //   .enter()
      //   .append('text')
      //   .attr('x', d => projection([d.longitude, d.latitude])[0])
      //   .attr('y', d => projection([d.longitude, d.latitude])[1])
      //   .attr('text-anchor', 'middle')
      //   .attr('alignment-baseline', 'middle')
      //   .attr('fill', 'black')
      //   .attr('font-size', '12px') 
      //   .text(d => d.country);
    });
  }, [world, width, height]);

  return (
    <div>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <svg ref={svgRef} width={width} height={height}></svg>
      )}
    </div>
  );
};

export default WorldMap;
