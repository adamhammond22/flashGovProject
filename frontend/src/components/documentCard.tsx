import { Link } from "react-router-dom";

function DocumentCard (props: {id:String, title: string, date: string, speaker:string}) {
    return (
        <div className="document-card">
            <p>{props.title}</p>
            <div className="date-view-container">
                <p>{props.date}</p>
                <Link to={`/document/${props.id}`}><button>View</button></Link>
            </div>
        </div>
    )
}
export default DocumentCard;