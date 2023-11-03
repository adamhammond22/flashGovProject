import { useState } from 'react';
import '../App.css';
import DocumentCard from './documentCard';
import Searchbar from './searchbar';
import FilterPanel from './filterpanel';

function Documents() {

    const [openFilter,toggleFilter] = useState(false);
    const [specDate,toggleSpecDate] = useState(false);
    const [keyWords, setKeywords]:any = useState([]);
    const [currentWord,setWord] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    const documentData:any[] = [
      {
        title: "H. Con. Res. 1 (Engrossed in House) - Regarding consent to assemble outside the seat of government.",
        date: "January 21, 2023",
        summary: "I made this up",
        speaker: "Jonathan"
      },
      {
        title: "Dummy document",
        date: "August 28, 2023",
        summary: "I made this up",
        speaker: "Jonathan"
      },
    ]

    // To Remove, Just adding here to avoid unused variables
    console.log(startDate,endDate);

    return (
      <div className='documents'>
        <Searchbar toggleFilter={toggleFilterCallback} />

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
          {!documentData.length && <h2>No Results</h2>}
          {documentData.map((document,index) => (<DocumentCard key={index} title={document.title} date={document.date} summary={document.summary} speaker={document.speaker}/>))}
        </div>

      </div>
    );

}
export default Documents;