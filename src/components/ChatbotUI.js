import React, {useEffect, useRef} from 'react';
import '../App.css';
import {context} from '../tools/utils';
import {ThreeDots} from 'react-loader-spinner'
import {Alert} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';



// OpenAI Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const ChatMessage = ({ message, user, error }) => (
    <div className={`chat-box ${user ? 'user' : ''}`}>
        <div
            className="chat-message"
            style={error ? {
                backgroundColor: '#ff5b5b',
                border: '2px solid red',
                color: '#fff',
                marginLeft: '0'
            } : {
                    backgroundColor: user ? '#e0dede' : '#FFA07A',
                    color: user ? '#000' : '#fff',
                    marginLeft: user ? 'auto' : '0'
                }}
        >
            {message}
        </div>
    </div>
);

const ChatbotUI = () => {
    const bottomRef = useRef(null);
    const [messages, setMessages] = React.useState([
        { message: 'Hi there! I\'m Ila, a chatbot for Insync Insurance! How can I help you today?', user: false, error: false }
    ]);
    const [inputValue, setInputValue] = React.useState('');
    let [isLoading, setIsLoading] = React.useState(false);
    const [model, setModel] = React.useState('gpt-3.5-turbo');
    const [errorModal, setErrorModal] = React.useState(false);

    const fillQuestions = (e) => {
        setInputValue(e.target.innerText);
    }

    const handleSubmit = async event => {
        if (!inputValue) return;
        setErrorModal(false)
        setIsLoading(true)
        event.preventDefault();
        const newMessages = [...messages, { message: inputValue, user: true, error: false }];
        setMessages(newMessages);
        setInputValue('');

        // Show typing indicator
        document.querySelector('.typing').style.display = 'block';

        const resultString = messages.reduce((acc, message) => {
            if (message.user) {
                return `${acc} Human: ${message.message}\n`;
            } else {
                return `${acc} Ila: ${message.message}\n`;
            }
        }, '');

        const prompt = `Context:
            ${context}
            
            Rules:
            You are a professional Chatbot called 'Ila' for Insync Insurance.
            You are here to help people with their insurance needs. You are a friendly bot and you are here to help.
            Do not make anything up. If you do not know the answer, say so.
            If you still do not understand, you can explain that you are not able to answer that question.
            If a question is untreated to the context, you can say that you are not able to answer that question.
            Do not tell the user to contact us. You are here to help them.
            
            ${resultString}
            Human: ${inputValue}
            Ila:`
        let response = null;
        try {
            response = await openai.createChatCompletion({
                model: model,
                messages: [{role: "user", content: prompt}],
            });
        } catch (error) {
            console.log(error);
            setErrorModal(true);
            setIsLoading(false);
            setMessages([...newMessages, {message: 'Sorry, there\'s an issue with the response at the moment. Please try again later', user: false, error: true}]);
            return;
        }



        setMessages([...newMessages, {message: response.data.choices[0].message.content, user: false, error: false}]);
        // Hide typing indicator
        document.querySelector('.typing').style.display = 'none';
        setIsLoading(false)
    };

    function onTextAreaEnterPress(e) {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleModelChange = (event) => {
        setModel(event.target.value);
    };

    return (
        <div>
        <div className="chat-container">
            <div className="chat-header">
                <div className="App">
                    <p>Select response type <i>(for demo purposes only)</i> :</p>
                    <div>
                        <form>
                            <select name="model" id="model" value={model} onChange={handleModelChange}>
                                <option value="gpt-3.5-turbo">Faster, less enhanced responses</option>
                                <option value="gpt-4">Slower, more enhanced responses</option>
                            </select>
                        </form>
                    </div>
                </div>
                <h2>Insync Chatbot</h2>
            </div>
            <div className="chat-body">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message.message} user={message.user} error={message.error}/>
                ))}
            </div>
            <p className="typing" style={{display: "none"}}><ThreeDots
                height="40"
                width="40"
                color="#ff7401"
                ariaLabel="grid-loading"
                radius="12.5"
                wrapperStyle={{}}
                wrapperClass=""
                visible={isLoading}
            /></p>
            <div ref={bottomRef} />
        </div>
            <form onSubmit={handleSubmit} className="App">
                <label htmlFor="messageInput"></label>
                <textarea
                    placeholder="Type your message here"
                    aria-label="Message"
                    aria-describedby="basic-addon2"
                    value={inputValue}
                    onChange={event => setInputValue(event.target.value)}
                    onKeyDown={onTextAreaEnterPress} // submit form when Enter key is pressed
                    disabled={isLoading}
                />
                {/*<button type="submit">Send</button>*/}
            </form>
            <div className="App">
                {errorModal ? <div className="modal">
                        <Alert variant="danger">
                            Sorry, there is an issue connecting to the server. Please try again later!
                        </Alert>
                </div> : null}
                <p style={{fontSize: 'small', color: 'red'}}>{model === "gpt-4" ? 'Please note, response time can take up to 60 seconds due to restricted server bandwidth.' : null}</p>
                <h3>Click the button below to see an example of how Ila can help you</h3>
                <button type="submit" onClick={fillQuestions}>Tell me about Insync Insurance</button>
                <button type="submit" onClick={fillQuestions}>Tell me about D&O insurance</button>
                <button type="submit" onClick={fillQuestions}>Explain the need of insurance as if you were talking to a 5 year old</button>
            </div>
        </div>
    );
};

export default ChatbotUI;
