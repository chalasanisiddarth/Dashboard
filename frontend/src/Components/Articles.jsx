import React,{ useState, useEffect } from 'react';
import './articles.css';


const Articles = ({width, height, value, filter, type}) => {
    const [data,setData]=useState();
    const [error,setError]=useState(null);
    const [w, setW]=useState();
    const [h, setH]=useState();

    useEffect(() => {
        fetchAData();
        setW(width);
        setH(height);
    },[value, width, height]);

    const fetchAData = async () => {
        try {
            if(filter==="home"){
                const response = await fetch(`/total_articles`);
                if(!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData[0].total_articles);
            } else if (type==="avg"){
                const response = await fetch(`/avg_relevance/${value}`);
                if(!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData[0].avg_relevance);
            } else if (type==="num"){
                const response = await fetch(`/no_of_topics/${value}`);
                if(!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData[0].total_topics);
            } else {
                const response = await fetch(`/no_of_articles/${filter.toLowerCase()}/${value}`);
                if(!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData[0].num_articles);
            }
        } catch(error){
            setError("Failed to fetch data");
            console.error("Error fetching data",error);
        }
    };

  return (
    <div className='num' style={{width: w, height: h}}>
            {type==="" &&
            <h3 style={{color: "#9c30db"}}>Number of Articles</h3>
            }
            {type==="avg" &&
            <h3 style={{color: "#9c30db"}}>Average Relevance of Source</h3>}
            {type==="num" && 
            <h3 style={{color: "#9c30db"}}>Number of Topics</h3>}
            
            <svg width={w} height={h}>
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: '55px', fontWeight: 'bold', color: "#E1E4FC"}}>{data}</text>
            </svg>
        </div>
  )
}

export default Articles;