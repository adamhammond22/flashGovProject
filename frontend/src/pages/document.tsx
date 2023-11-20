import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import { parseAndFormatDate } from "../components/helpers";
import Spinner from 'react-bootstrap/Spinner';
import { TbRefresh } from "react-icons/tb";
import { IconContext } from "react-icons/lib";

function Document() {

    // Getting document ID From url parameter
    const {id} = useParams();
    const [speechInfo,setSpeechInfo] = useState({title:"",speaker:"",
    date: "" ,text:"",section:"", summary:"", url:""});
    const [unprocessedSpeechInfo, setUnprocessedSpeechInfo] = useState({title:"",speaker:"",
    date: "" ,text:"",section:"", summary:"", url:""});
    const [collapsed, toggleCollapsed] = useState(true);
    const [loading, setLoading] = useState(false);

    const parseAndSetSpeech = async(resJson:any) => {
        setUnprocessedSpeechInfo(resJson);
        const dateString = parseAndFormatDate(resJson.date);
        const decodeText = atob(resJson.text);
        setSpeechInfo({...resJson, date:dateString,text:decodeText});
    }

    const clearCurrentSummary = async() => {
        try {
            setLoading(true);
            let jsonStr = JSON.stringify({...unprocessedSpeechInfo, summary:undefined});
            const res = await fetch(`/api/speeches/${id}`, {method:"PATCH", headers: {
                'Content-Type': 'application/json'}, body: jsonStr});
            const resJson = await res.json()
            await parseAndSetSpeech(resJson);
            setLoading(false);
       } catch (e) {
        alert(e);
       }
    }

    useEffect(() => {
        const getSpeechInfo = async() => {
            try {
                 setLoading(true);
                 const res = await fetch(`/api/speeches/${id}`);
                 const resJson = await res.json()
                 await parseAndSetSpeech(resJson);
                 setLoading(false);
            } catch (e) {
             alert(e);
            }
        }
        getSpeechInfo();
    },[id])
    
    if (loading)
        return (<div className="App" style ={{justifyContent: 'center', alignItems: 'center', display: 'flex'}}><Spinner/></div>);

    return (
        <div className="App">
            <div className="individual-document wrapper">
                <Link className="link" to="/"><button className="back">Back</button></Link>
                <h1>{speechInfo.title}</h1>
                <hr/>
                <h3>Date of Speech: {speechInfo.date}</h3>
                <h3>Speaker: {speechInfo.speaker}</h3>
                <h3>Chamber: {speechInfo.section}</h3>
                <div className="source-button">
                    {speechInfo.url && <a href={speechInfo.url} target="_blank" rel="noopener noreferrer"><button className="back">Source</button></a>}
                </div>
                <div className="summary-container">
                    <h2>Summary</h2>
                    <p>{speechInfo.summary}</p>
                    <div className="refresh-button" title="Regenerate summary">
                        <IconContext.Provider value={{className: "refresh-button", size: '30px'}}>
                            <button style={{backgroundColor:'#E3E3E3'}} onClick={clearCurrentSummary}><TbRefresh/></button>
                        </IconContext.Provider>
                    </div>
                </div>
                <div>
                    <button className="collapse-button" onClick={() => toggleCollapsed(!collapsed)}>{collapsed ? "View Speech" : "Close"}</button>
                </div>
                {!collapsed && <p className="speech-content">"{speechInfo.text}"</p>}
            </div>
        </div>
    )
} 

export default Document