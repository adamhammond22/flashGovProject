import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import { parseAndFormatDate } from "../components/helpers";

function Document() {

    // Getting document ID From url parameter
    const {id} = useParams()
    const [speechInfo,setSpeechInfo] = useState({title:"",speaker:"",
    date: "" ,text:"",section:"",
    summary:""})

    const [collapsed, toggleCollapsed] = useState(true);

    useEffect(() => {
        const getSpeechInfo = async() => {
           try {
                const res = await fetch(`/api/speeches/${id}`);
                const resJson = await res.json()
                const dateString = parseAndFormatDate(resJson.date)
                const decodeText = atob(resJson.text)
                setSpeechInfo({...resJson, date:dateString,text:decodeText});
           } catch (e) {
            alert(e);
           }
        }
        getSpeechInfo();
    },[id])

    return (
        <div className="App">
            <div className="individual-document wrapper">
                <Link className="link" to="/"><button className="back">Back</button></Link>
                <h1>{speechInfo.title}</h1>
                <hr/>
                <h3>Date of Speech: {speechInfo.date}</h3>
                <h3>Speaker: {speechInfo.speaker}</h3>
                <h3>Chamber: {speechInfo.section}</h3>
                <div className="summary-container">
                    <h2>Summary</h2>
                    <p>{speechInfo.summary}</p>
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