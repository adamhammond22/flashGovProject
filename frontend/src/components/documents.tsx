import { useState, useEffect } from 'react';
import '../App.css';
import DocumentCard from './documentCard';
import SearchBar from './searchbar';
import FilterPanel from './filterpanel';
// Import speech obj interfaces
import { Speech } from '../models/speechInterface';

function Documents() {

    const [openFilter,toggleFilter] = useState(false);
    const [specDate,toggleSpecDate] = useState(false);
    const [keyWords, setKeywords]:any = useState([]);
    const [currentWord,setWord] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
  
    /* State of loaded speeches */
    const [loadedSpeeches, setLoadedSpeeches] = useState<Speech[]>([]);

    useEffect(()=>{
      async function loadSpeeches(){
        try {
          // Query Server for speeches
          // Able to leave out the localhost/5000 portion because of proxy in package.json
          const response = await fetch("/api/speeches", {method:"GET"});
          const returnedSpeeches = await response.json();
          setLoadedSpeeches(returnedSpeeches);
        } catch (error) {
          console.error(error);
          alert(error);
        }
      }
      loadSpeeches();
    }, []);



    // Passed into Searchbar component to open or close filter panel
    const toggleFilterCallback = () => {
      setWord("");
      toggleFilter(!openFilter);
    }

    // Passed into filterpanel component to toggle specific date
    const toggleSpecDateCallback = () => {
      toggleSpecDate(!specDate);
    }
    
    // Passed into FilterPanel to handle text input changes for keyword
    const setCurrentWordCallback = (e:any) => {
      setWord(e.target.value);
    }

    // Passed into Filterpanel to add a new keyword
    const pushKeywordCallback = () => {
      if (currentWord) setKeywords([...keyWords, currentWord]);
    }
    
    

    // Passed into Filterpanel to remove a keyword
    const removeWordCallback = (index:any) => {
      setKeywords(keyWords.filter((keyword: string,i:number) => index !== i));
    }
    
    // Passed into filterpanel to handle startDate changes
    const setStartDateCallback = (e:any) => {
      setStartDate(e.target.value);
    }
    
    //Passed into Filterpanel to handel endDate Change
    const setEndDateCallback = (e:any) => {
      setEndDate(e.target.value);
    }

    // To Remove, Just adding here to avoid unused variables
    console.log(startDate,endDate);

    return (
      <div className='documents'>
        <SearchBar toggleFilter={toggleFilterCallback} />
      
        {/* If the filter panel is toggled display the following*/}
        {openFilter && 
          <FilterPanel specDate={specDate} keywords={keyWords}
           addKeyword={pushKeywordCallback} toggleFilter={toggleFilterCallback}
            toggleSpecDate={toggleSpecDateCallback} setWord={setCurrentWordCallback} 
            currentWord={currentWord} removeItem={removeWordCallback}
            setStartDate={setStartDateCallback} setEndDate={setEndDateCallback}
            />          
        }

        {/* Displays all the document date */}
        <div className='document-container'>
          {!loadedSpeeches.length && <h2>No Results</h2>}
          {loadedSpeeches.map((document,index) => (<DocumentCard key={document._id} id={document._id} title={document.title} date={new Date(document.date).toLocaleDateString("en-us", {year:"numeric", month: "long", day: "numeric"})} speaker={document.speaker}/>))}
        </div>

      </div>
    );

}
export default Documents;