import { Link } from "react-router-dom";

function DocumentCard (props: {id:String, title: string, date: string, speaker:string}) {
    return (
        <div className="document-card">
            <div className="card-speaker-title">
                <h1>{props.title}</h1>
                <p>{props.speaker}</p>
            </div>
            <div className="date-view-container">
                <p>{props.date}</p>
                <Link to={`/document/${props.id}`}><button>View</button></Link>
            </div>
        </div>
    )
}
export default DocumentCard;