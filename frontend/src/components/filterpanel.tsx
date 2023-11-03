function FilterPanel(props:{specDate:boolean,toggleFilter:any,toggleSpecDate:any,
    addKeyword:any,keywords:string[],currentWord:string,setWord:any,removeItem:any
    setStartDate:any,setEndDate:any}) {
    return (
        <div className='filter-panel-overlay'>
            {/* filter-panel is the main filter screen users interact with */}
            <div className='filter-panel'>

              {/* toggle the filter off */}
              <button onClick={props.toggleFilter}>Close</button>
              <h1>Edit Filters</h1>

              {/* Date Filters */}
              <div className='date-filters'>
                <h2>Date</h2>
                <hr/>
                <div className='checkbox-container'>
                  <input checked={props.specDate} onChange={props.toggleSpecDate} type='checkbox'/>
                  <p>On Specific Date</p>
                </div>
                <div className='range-inputs'>
                  <div>
                    <h3>From</h3>
                    <input onChange={props.setStartDate} type="date"/>
                  </div>
                  {!props.specDate && 
                    <div>
                      <h3>To</h3>
                      <input onChange={props.setEndDate} type="date"/>
                    </div>
                  }
                </div>
              </div>

              {/* Keyword filters */}
              <div className='keyword-filters'>
                <h2>Keywords</h2>
                <hr/>
                <div className='keyword-input-wrapper'>
                  <input onChange={props.setWord} type='text' placeholder='Add Keywords'/>
                  <button onClick={props.addKeyword}>Add</button>
                </div>
                <div className="keywords-container">
                    {props.keywords.map((keyword,index) => <button onClick={() => props.removeItem(index)} key={index}>{keyword}</button>)}
                </div>
              </div>
            </div>
          </div>
    )
}
export default FilterPanel;