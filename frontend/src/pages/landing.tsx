import Header from '../components/header';
import Documents from '../components/documents';

function Landing() {
  
    return (
      <div className='wrapper'>
        <Header/>
        <h1 style={{"fontSize": 40}}>Relevant Documents</h1>
        <hr/>
        <Documents/>
      </div>
    );

}
export default Landing;