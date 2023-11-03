
function DocumentCard (props: {title: string, date: string, summary: string, speaker:string}) {
    return (
        <div className="document-card">
            <p>{props.title}</p>
            <div className="date-view-container">
                <p>{props.date}</p>
                <button>View</button>
            </div>
        </div>
    )
}
export default DocumentCard;