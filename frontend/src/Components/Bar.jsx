import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const HorizontalBar = ({ width, height, value, filter }) => {
  const svgRef = useRef();
  const [bar, setBar] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBar();
  }, [value]);

  const fetchBar = async () => {
    try {
      console.log(filter);
      if(filter==="Source"){
        const response = await fetch(`/source_topics/${value}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setBar(jsonData);
      } else if(filter){
        const response = await fetch(`/source/${filter.toLowerCase()}/${value}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setBar(jsonData);
      } else {
        const response = await fetch(`/top_sources`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setBar(jsonData);
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!bar || bar.length === 0) return;

    const svg = d3.select(svgRef.current);

    console.log(bar);

    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

      const y = d3.scaleBand()
      .domain(bar.map(d => (filter==="Source"?d.topic:d.source)))
      .range([0, innerHeight])
      .padding(0.1);
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(bar, d => d.avg_relevance)])
      .range([0, innerWidth]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top + innerHeight})`)
      .call(xAxis);

    svg.append('text') // x-axis label
    .attr('x', width / 2)
    .attr('y', height - margin.bottom / 4)
    .style('text-anchor', 'middle')
    .text('Average Relevance');

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis);

      svg.append('text') // y-axis label
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', margin.left / 6)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Source');

    svg.selectAll('.bar')
      .data(bar)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', margin.left) 
      .attr('y', d => y(d.source) + margin.top) 
      .attr('width', d => x(d.avg_relevance)) 
      .attr('height', y.bandwidth()) 
      .attr('fill', 'turquoise');
  }, [bar, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
};

export default HorizontalBar;
