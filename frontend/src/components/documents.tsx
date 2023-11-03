import { useState, useEffect } from 'react';
import '../App.css';
import DocumentCard from './documentCard';
import Searchbar from './searchbar';
import FilterPanel from './filterpanel';
// Import speech obj interfaces
import { Speech } from '../models/speechInterface';

function Documents() {

    const [openFilter,toggleFilter] = useState(false);
    const [specDate,toggleSpecDate] = useState(false);
    const [keyWords, setKeywords]:any = useState([]);
    const [currentWord,setWord] = useState("");
    /* State of loaded speeches */
    const [loadedSpeeches, setLoadedSpeeches] = useState<Speech[]>([]);

    useEffect(()=>{
      async function loadSpeeches(){
        try {
          // Query Server for speeches
          const response = await fetch("http://localhost:5000/api/speeches", {method:"GET"});
          const returnedSpeeches = await response.json();
          setLoadedSpeeches(returnedSpeeches);
          console.log("speeches:", loadedSpeeches)
        } catch (error) {
          console.error(error);
          alert(error);
        }
      }
      loadSpeeches();
    }, []);

    const toggleFilterCallback = () => {
      setWord("");
      toggleFilter(!openFilter);
    }

    const toggleSpecDateCallback = () => {
      toggleSpecDate(!specDate);
    }

    const setCurrentWordCallback = (e:any) => {
      setWord(e.target.value);
    }

    const pushKeywordCallback = () => {
      if (currentWord) setKeywords([...keyWords, currentWord]);
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

    return (
      <div className='documents'>
        <Searchbar toggleFilter={toggleFilterCallback} />

        {/* If the filter panel is toggled display the following*/}
        {openFilter && 
          <FilterPanel specDate={specDate} keywords={keyWords}
           addKeyword={pushKeywordCallback} toggleFilter={toggleFilterCallback}
            toggleSpecDate={toggleSpecDateCallback} setWord={setCurrentWordCallback} currentWord={currentWord}
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