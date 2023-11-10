import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"

function Document() {

    // Getting document ID From url parameter
    const {id} = useParams()
    const [speechInfo,setSpeechInfo] = useState({title:"",speaker:"",
    date:new Date(),text:"",section:"",
    summary:""})

    const [collapsed, toggleCollapsed] = useState(true);

    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    useEffect(() => {
        const getSpeechInfo = async() => {
           try {
                const res = await fetch(`/api/speeches/${id}`);
                const resJson = await res.json()
                const dateObject = new Date(resJson.date)
                const decodeText = atob(resJson.text)
                setSpeechInfo({...resJson, date:dateObject,text:decodeText});
           } catch (e) {
            alert(e);
           }
        }
        getSpeechInfo();
    },[id])

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(speechInfo.date);
    return (
        <div className="App">
            <div className="individual-document wrapper">
                <Link className="link" to="/"><button className="back">Back</button></Link>
                <h1>{speechInfo.title}</h1>
                <hr/>
                <h3>Date of Speech: {formattedDate}</h3>
                <h3>Speaker: {speechInfo.speaker}</h3>
                <h3>Chamber: {speechInfo.section}</h3>
                <div className="summary-container">
                    <h2>Summary</h2>
                    <p>{lorem}</p>
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