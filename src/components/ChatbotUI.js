import React, {useEffect, useRef} from 'react';
import '../App.css';
import {context} from '../tools/utils';


// OpenAI Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const ChatMessage = ({ message, user }) => (
    <div className={`chat-box ${user ? 'user' : ''}`}>
        <div
            className="chat-message"
            style={{
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
        { message: 'Hi there! I\'m Ila, a chatbot for Insync Insurance! How can I help you today?', user: false }
    ]);
    const [inputValue, setInputValue] = React.useState('');

    const fillQuestions = (e) => {
        setInputValue(e.target.innerText);
    }

    const handleSubmit = async event => {
        event.preventDefault();
        const newMessages = [...messages, { message: inputValue, user: true }];
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

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.9,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
        });
        setMessages([...newMessages, {message: response.data.choices[0].text, user: false}]);
        // Hide typing indicator
        document.querySelector('.typing').style.display = 'none';
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

    return (
        <div>
        <div className="chat-container">
            <div className="chat-header">
                <h2>Insync Chatbot</h2>
            </div>
            <div className="chat-body">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message.message} user={message.user} />
                ))}
            </div>
            <p className="typing" style={{display: "none"}}>Ila is typing...</p>
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
                />
                {/*<button type="submit">Send</button>*/}
            </form>
            <div className="App">
                <h3>Click the button below to see an example of how Ila can help you</h3>
                <button type="submit" onClick={fillQuestions}>Tell me about Insync Insurance</button>
                <button type="submit" onClick={fillQuestions}>Tell me about D&O insurance</button>
                <button type="submit" onClick={fillQuestions}>Explain the need of insurance as if you were talking to a 5 year old</button>
            </div>
        </div>
    );
};

export default ChatbotUI;
