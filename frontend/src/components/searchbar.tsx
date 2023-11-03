import filter from "../assets/filter-edit.png";

function Searchbar(props:{toggleFilter:any}){

    return (
        <div className="searchbar">
            <input type="text" placeholder="Search for a speaker"/>
            <img onClick={props.toggleFilter} src={filter} alt=""/>
        </div>
    );
}

export default Searchbar;