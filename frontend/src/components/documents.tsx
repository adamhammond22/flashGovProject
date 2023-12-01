import { useState, useEffect } from 'react';
import '../App.css';
import { parseAndFormatDate } from './helpers';
import DocumentCard from './documentCard';
import SearchBar from './searchbar';
import FilterPanel from './filterpanel';
import { useSpeechesStore } from '../speechesStore';

function Documents() {

    const [openFilter,toggleFilter] = useState(false);
    const [specDate,toggleSpecDate] = useState(false);
    const [keyWords, setKeywords]:any = useState([]);
    const [currentWord,setWord] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Set true while the search is being performed and false once the search is finished
    const [searchingState, setSearchingState] = useState(false);

    const [searchBarText, setSearchBarText] = useState("");
  
    /* State of loaded speeches */
    const {speeches, setSpeeches} = useSpeechesStore()

    useEffect(()=>{
      //loadSpeeches();
    }, []);

    async function loadSpeeches(){
      setSearchingState(true);
      
      try {
        // Query Server for speeches
        
        let paramList = []
        if (startDate)
          paramList.push("startDate=" + startDate);
        if (endDate)
          paramList.push("endDate=" + endDate);
        if (searchBarText)
          paramList.push("speaker=" + searchBarText);
        if (keyWords.length > 0){
          keyWords.forEach((kw:String) => {
            paramList.push("keywords="+kw);
          })
        }

        const params = paramList.join("&");
          
        // Able to leave out the localhost/5000 portion because of proxy in package.json
        const response = await fetch("/api/speeches?" + params, {method:"GET"});
        const returnedSpeeches = await response.json();
        setSpeeches(returnedSpeeches);
      } catch (error) {
        console.error(error);
        alert(error);
      }

      setSearchingState(false); 
    }
    // Passed into SearchBar component to open or close filter panel
    const toggleFilterCallback = () => {
      setWord("");
      toggleFilter(!openFilter);
    }

    // Passed into FilterPanel component to toggle specific date
    const toggleSpecDateCallback = () => {
      toggleSpecDate(!specDate);
    }
    
    // Passed into FilterPanel to handle text input changes for keyword
    const setCurrentWordCallback = (e:any) => {
      setWord(e.target.value);
    }

    // Passed into FilterPanel to add a new keyword
    const pushKeywordCallback = () => {
      if (currentWord) setKeywords([...keyWords, currentWord]);
    }

    // Passed into the search bar, called when the search button is pressed
    const performSearch = () => {
      loadSpeeches();
    }

    // Passed into FilterPanel to remove a keyword
    const removeWordCallback = (index:any) => {
      setKeywords(keyWords.filter((keyword: string,i:number) => index !== i));
    }
    
    // Passed into FilterPanel to handle startDate changes
    const setStartDateCallback = (e:any) => {
      setStartDate(e.target.value);
    }
    
    //Passed into FilterPanel to handel endDate Change
    const setEndDateCallback = (e:any) => {
      setEndDate(e.target.value);
    }

    const onSearchBarChanged = (e:any) => {
      setSearchBarText(e.target.value);
    }

    return (
      <div className='documents'>
        <SearchBar toggleFilter={toggleFilterCallback} onSearchBarChanged={onSearchBarChanged} searchCallback={performSearch} searchingState={searchingState} />

        {/* If the filter panel is toggled display the following*/}
        {openFilter && 
          <FilterPanel specDate={specDate} keywords={keyWords}
           addKeyword={pushKeywordCallback} toggleFilter={toggleFilterCallback}
            toggleSpecDate={toggleSpecDateCallback} setWord={setCurrentWordCallback} 
            currentWord={currentWord} removeItem={removeWordCallback}
            setStartDate={setStartDateCallback} setEndDate={setEndDateCallback}
            startDate={startDate} endDate={endDate} 
            />          
        }

        {/* Displays all the document date */}
        <div className='document-container'>
          {!speeches.length && <h2>No Results</h2>}
          {speeches.map((document,index) => (<DocumentCard key={document._id} id={document._id} title={document.title} date={parseAndFormatDate(document.date)} speaker={document.speaker}/>))}
        </div>

      </div>
    );

}
export default Documents;