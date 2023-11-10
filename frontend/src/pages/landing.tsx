import Header from '../components/header';
import Documents from '../components/documents';

function Landing() {
  
    return (
      <div className='App'>
        <div className='wrapper'>
          <Header/>
          <h1 style={{"fontSize": 40}}>Relevant Documents</h1>
          <hr/>
          <Documents/>
        </div>
      </div>
    );

}
export default Landing;