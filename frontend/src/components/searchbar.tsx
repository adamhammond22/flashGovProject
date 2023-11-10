import filter from "../assets/filter-edit.png";

function SearchBar(props:{toggleFilter:any, searchCallback:any, searchingState:boolean, onSearchBarChanged:any}){

    return (
        <div className="search-bar">
            <input onChange={props.onSearchBarChanged} type="text" placeholder="Search for a speaker"/>
            <div className="filter-button">
                <button><img onClick={props.toggleFilter} src={filter} alt=""/></button>
            </div>
            <button onClick={props.searchCallback} style={{ marginLeft: '30px', padding:'10px'}}>
                Search
            </button>
            {props.searchingState && 
            <div>
                <span style={{marginLeft:'15px'}}></span>
                Searching...
            </div>
            }
        </div>
    );
}

export default SearchBar;