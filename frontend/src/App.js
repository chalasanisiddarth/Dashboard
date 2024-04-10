import {useState,useEffect, useLayoutEffect, useRef} from 'react';
import './App.css';
import Filter from './Components/filter/Filter';
import WorldMap from './Components/WorldMap';
import Bar from './Components/Bar';
import Line from './Components/Line';
import PieChart from './Components/PieChart';
import RadarChart from './Components/RadarChart';
import ScatterPlot from './Components/ScatterPlot';
import Articles from './Components/Articles';

function App() {
  const [filter,setFilter] = useState("");
  const [value, setValue] = useState("");
  const columnRef = useRef(null);

  function chooseFilter(msg) {
    setFilter(msg);
  }

  function chooseValue(val){
    setValue(val);
  }

  useEffect(() => {
    setFilter(e=>{
      if(e!==filter){
        return filter;
      }
      return e;
    })
    console.log('new state', filter)
  }, [filter])

  useEffect(() => {
    setValue(e=>{
      if(e!==value){
        return value;
      }
      return e;
    })
    console.log('new state', value)
  }, [value])

  return (
    <div className="App" style={{ backgroundColor: (value==="" || filter==="select") ? "#E1E4FC" : "#E0ECEC"}}>
      <Filter chooseFilter={chooseFilter} chooseValue={chooseValue} className="column-20"></Filter>
      <div ref={columnRef} className='column-80'>
        {(value==="" || filter==="select") &&
          <div className='about'>
            <h1>VDashboard</h1>
            <h6>Welcome to your premier destination for insightful charts spanning a myriad of topics across diverse countries. Our platform is designed to provide you with comprehensive visualizations that offer valuable insights into global trends, socio-economic indicators, cultural phenomena etc. Whether you're a researcher, student, policymaker, or simply curious about the world around you, we empower users to explore, understand, and engage with data-driven narratives shaping societies worldwide.</h6>
              <div className='chart home'>
                <Articles className="article" filter={"home"} value={""} type={""} width={225} height={150}></Articles>
                {/* <Bar filter={filter} width={300} height={200}/> */}
              </div>
              <div className='chart home'>
                <Bar filter={filter} width={300} height={200}/>
              </div>
              <div className='chart home'>
                <WorldMap filter={filter} width={800} height={500}/>
              </div>
          </div>
          
        }
        {(filter==="Country" && value!=="") &&
        <div>
          <h3>Country</h3>
            <div className='section'>
            <div className='chart'>
              <Articles filter={filter} value={value} width={400} height={250}></Articles>
              </div>
              <div className='chart'>
              <Bar filter={filter} value={value} width={400} height={250}/>
              </div>
              <div className='chart'>
              <RadarChart filter={filter} value={value} width={400} height={250}/>
              </div>
              <div className='chart'>
              <PieChart filter={filter} value={value} width={400} height={250}/>
              </div>
            </div>
            </div>
        }
        {(filter==="Region" && value!=="") &&
        <div>
          <h3>Country</h3>
            <div className='section'>
              <div className='chart'>
                <WorldMap filter={filter} width={400} height={250}/>
              </div>
              <div className='chart'>
              <Bar filter={filter} value={value} width={400} height={250}/>
              </div>
              <div className='chart'>
              <RadarChart filter={filter} value={value} width={400} height={250}/>
              </div>
              <div className='chart'>
              <PieChart filter={filter} value={value} width={400} height={250}/>
              </div>
            </div>
            </div>
        }
        {(filter==="Source" && value!=="") &&
          <div>
            <h3>Source</h3>
          <div className='section'>
              <div className='chart'>
                <Articles filter={filter} value={value}  type={"avg"} width={400} height={250}></Articles>
              </div>
              <div className='chart'>
                <Articles filter={filter} value={value} type={"num"} width={400} height={250}></Articles>
              </div>
              <div className='chart'>
               <Bar filter={filter} value={value} width={400} height={250}/>
              </div>
              <div className='chart'>
                <Line filter={filter} width={400} height={250}/>
              </div>
        </div>
          </div>
        }
      </div>  
    </div>
  );
}

export default App;
