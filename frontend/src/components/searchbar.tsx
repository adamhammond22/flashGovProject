import filter from "../assets/filter-edit.png";

function SearchBar(props:{toggleFilter:any, searchCallback:any}){

    return (
        <div className="search-bar">
            <input type="text" placeholder="Search for a speaker"/>
            <div className="filter-button">
                <button><img onClick={props.toggleFilter} src={filter} alt=""/></button>
            </div>
            <button onClick={props.searchCallback} style={{ marginLeft: '30px', padding:'10px'}}>
                Search
            </button>
        </div>
    );
}

export default SearchBar;