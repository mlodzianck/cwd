import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader, Avatar, TypingIndicator } from '@chatscope/chat-ui-kit-react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';



const Chat = () => {
    const [typeOfDoc, setTypeOfDoc] = useState("")
    const [messages, setMessages] = useState([])
    const [sendDisabled, setSendDisabled] = useState(false)
    const navigate = useNavigate();



    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/get_doc_type/");
            const docTypeResponse= await response.json();
            if (docTypeResponse.type_of_doc!="") {
                setTypeOfDoc(docTypeResponse.type_of_doc)
            } else {
                setTypeOfDoc("Nieznany typ dokumentu")
            }
        }
        fetchData();
      }, []);


      useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/get_all_messages/");
            const messagesResponse= await response.json();
            setMessages(messagesResponse.messages)
        }
        fetchData();
      }, []);


    const renderMessages = () => {
        const items = messages.map((o,i) => {
            return <Message model={{
                message: o.message,
                sender: o.direction=="assistant"?"Assistant":"Ty",
                direction: o.direction=="assistant"?"incoming":"outgoing",
                position: "single"
            }}>
                {o.direction==="assistant" && <Avatar src={"https://ui-avatars.com/api/?name=Asystsent"} name="assistant" />}
                {o.direction!=="assistant" && <Avatar src={"https://ui-avatars.com/api/?name=Ty"} name="Ty" />}
            </Message>
        })



        return items
    }

    const handleSend = (innerHtml,textContent ) => {
        setMessages(current => [...current, {direction: "human",message: textContent}])
        setSendDisabled(true)
        async function ask() {
            const response = await fetch("/api/ask/",{
                method: 'POST', 
                body: JSON.stringify({question: textContent}),
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            
            }).then((response) => {
                if (response.status >= 400 && response.status < 600) {
                    setMessages(current => [...current, {direction: "assistant",message: "Błąd"}])
                }
                return response;
            }).catch((error) => {
                setMessages(current => [...current, {direction: "assistant",message: "Błąd"}])
            });
            const askResponse = await response.json();
            setMessages(current => [...current, {direction: "assistant",message: askResponse.message}])
            setSendDisabled(false)
        }
        ask()

    }


    return <Container 
    // style={{ height: "70vh" }} 
    fluid>
        <Row className="justify-content-md-center">
            <Col md={8} sm={12}>
                <div style={{ height: "90vh" }}  >
                    <MainContainer>
                        <ChatContainer style={{ minHeight: "80vh" }} >
                            <ConversationHeader>
                                <ConversationHeader.Back onClick = {() =>  navigate('/')}/>
                                <ConversationHeader.Content userName={typeOfDoc} info="" />

                            </ConversationHeader>
                            <MessageList  typingIndicator={sendDisabled && <TypingIndicator content="Asystent generuje odpowiedź" />}>

                                {renderMessages()}



                               

                            </MessageList>
                            <MessageInput placeholder="Zadaj pytanie" attachButton={false} onSend={handleSend} sendDisabled={sendDisabled}/>
                        </ChatContainer>
                    </MainContainer>
                </div>
            </Col>

        </Row>
    </Container>
}

export default Chat