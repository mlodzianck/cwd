
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { styled } from 'styled-components';

import { useNavigate } from 'react-router-dom';

import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from 'react-bootstrap';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(false);






  const navigate = useNavigate();
  const removeDiacritics = (inputString) => {
    return inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

  const handleFileChange = async (e) => {
    setUploadStatus('');
    setUploadDisabled(true)
    setSpinnerVisible(true)
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setUploadStatus('Nie wybrano pliku.');
      setUploadDisabled(false)
      setSpinnerVisible(false)
      return;
    }

    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Disposition': `attachment; filename="${removeDiacritics(selectedFile.name)}"`
        }
      });

      if (response.status === 200) {
        setUploadDisabled(false)
        setSpinnerVisible(false)
        setUploadStatus('Plik został przesłany pomyślnie!');
        navigate('/chat');
        
      } else {
        setUploadStatus('Wystąpił błąd podczas przesyłania pliku.');
        setUploadDisabled(false)
        setSpinnerVisible(false)
      }
    } catch (error) {
      setUploadStatus('Wystąpił błąd podczas przesyłania pliku.');
      setUploadDisabled(false)
      setSpinnerVisible(false)
    }
  };


  const Label = styled.label`
    border: 5px dotted grey;
    height: 15em;
    width: 15em;
    margin-top: 3em;
    border-radius: 1em;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    width: 100%;
    cursor: pointer;
    padding-top: 2em;


  `

  const DivWrapper = styled.div`
  `

  const CrossWrapper=styled.div`
  height: 5em;
  width: 5em;
  border-radius: 2.5em;
  border: 5px solid lightgrey;
  font-size: 5em;
  `

  return (
    <div>
      <Label>
        {!uploadDisabled &&<> <input type="file" onChange={handleFileChange} style={{ display: "none" }}/>
        <div>Dodaj plik aby rozpocząć nowy chat</div>
        <div >
        <FontAwesomeIcon icon={faCirclePlus} size="2xl" style={{color: "#aab6cb",}} />
        </div> </>}
        {spinnerVisible && <div>
          <Spinner animation="grow" />
          <Spinner animation="grow" />
          <Spinner animation="grow" />
        </div>}
      </Label>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}




const Upload = () => {
  const [files, setFiles] = useState([]);
  const [currentDocType,setCurrentDocType] = useState('')
  const [isActive,setIsActive] = useState(false)
  const navigate = useNavigate();
  const samples = [
    {file: "wyciag_bankowy.pdf", description: "Wyciąg bankowy", thumbfile: "wyciag_bankowy_thumb.jpg"},
    {file: "umowa.pdf", description: "Umowa",thumbfile: "umowa_thumb.jpg"},
  ]

  
  useEffect(() => {
    async function fetchCurrentDoc() {
      const response = await fetch("/api/get_doc_type/");
            const docTypeResponse= await response.json();
            if (docTypeResponse.type_of_doc!="") {
              setCurrentDocType(docTypeResponse.type_of_doc)
            } else {
              setCurrentDocType("Nieznany typ dokumentu")
            }
  }


    async function fetchData() {
        const response = await fetch("/api/is_active/");
        const isActiveResponse= await response.json();
        if (isActiveResponse.type_of_doc!="") {
          setIsActive(isActiveResponse.is_active)
          fetchCurrentDoc()
        } 
    }
    fetchData();
  }, []);

  return <Container style={{ paddingTop: "2em" }} fluid>


   
    <Row className="justify-content-md-center justify-content-sm-center">
      <Col md={4} sm={10} className='text-center'>
          <h1>Chat with document</h1>
      </Col>

    </Row>
    {isActive && <Row className="justify-content-md-center justify-content-sm-center">
      <Col md={4} sm={10} className='text-center'>
        <h3>  <a href='/chat'>Wróć do czatu z dokumentem: {currentDocType}</a></h3>
      </Col>
      <Row className="justify-content-md-center justify-content-sm-center">
      <Col md={4} sm={10} className='text-center'>lub</Col>
      </Row>
    </Row>}
    <Row className="justify-content-md-center justify-content-sm-center">
      <Col md={4} sm={10} className='text-center'>
          <FileUpload />

      </Col>

    </Row>
    <Row className="justify-content-md-center justify-content-sm-center">
      <Col md={4} sm={10} className='text-center'>
          Lub wykorzystaj jeden z przykładów

      </Col>

    </Row>

    <Row className="justify-content-md-center justify-content-sm-center">
      {samples.map((o,i)=> {
        return <Col md={2} sm={2} className='text-center'>
          <div>
            <a href={"/static/samples/"+o.file}>
              <img src={o.thumbfile}/>
            </a>
          </div>
          <div>{o.description}</div>
          </Col>
      })}

    </Row>
  </Container>
}

export default Upload