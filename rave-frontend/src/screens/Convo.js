import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import axios from 'axios';
import { FaMicrophone } from 'react-icons/fa';

import { API_BASE_URL } from '../constants';

export default function Convo() {

  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [firstRender, setFirstRender] = useState(true);
  const [speech, setSpeech] = useState('');
  const [recognition, setRecognition] = useState(null);

  const pushMessage = (msg, byUser) => {
    messages.push({
      key: Math.random().toString(16).substr(2),
      text: msg,
      byUser
    });
    setMessages([...messages]);
  };

  const handleUserMessage = event => {
    event.preventDefault();
    pushMessage(userMessage, true);
    setUserMessage('');

    axios.get(`${API_BASE_URL}/dialogflow/pizza_types/${userMessage}`)
      .then(resp => {
        console.log(messages)
        pushMessage(resp.data.fulfillment_text, false);
        readOutLoud(resp.data.fulfillment_text);
      })
      .catch((e) => {
        console.error(e)
        pushMessage('A network error occured', false);
      });
  };

  const initMic = () => {
    if (speech) {
      recognition.stop();
      setSpeech('');
      setRecognition(null);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    setRecognition(recognition);

    recognition.onstart = function() { 
      console.log('Voice recognition activated. Try speaking into the microphone.');
    };

    recognition.onspeechend = function() {
      console.log('You were quiet for a while so voice recognition turned itself off.');
      if (speech)
        pushMessage(speech, true);
      setSpeech('');
    };

    recognition.onerror = function(event) {
      if (event.error == 'no-speech') {
        console.error('No speech was detected. Try again.');  
      };
    };

    recognition.onresult = function(event) {
      const current = event.resultIndex;

      // Get a transcript of what was said.
      const transcript = event.results[current][0].transcript;

      const mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

      if (!mobileRepeatBug) {
        // Add the current transcript to the contents of our Note.
        speech += transcript;
        setSpeech(speech);
        setUserMessage(speech);
      }
    };

    recognition.start();
  };

  const readOutLoud = message => {
    var speech = new SpeechSynthesisUtterance();

    // Set the text and voice attributes.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    document.title = 'Bot | Rav\'n';
    firstRender && pushMessage('Hi there!', false);
    setFirstRender(false);
  }, [firstRender]);

  return (
    <div>
      <ChatTitle>Rav'n <span>Assistant</span></ChatTitle>

      <ChatWrapper>
        <div className="chat-output" id="chat-output">
          {
            messages.map(({ key, text, byUser }) => (
              <div key={key} className={`${byUser ? 'user-message' : 'bot-message'}`}>
                <div className="message">{text}</div>
              </div>
            ))
          }
        </div>

        <div className="chat-input">
          <InputForm 
            action="" 
            method="POST" 
            onSubmit={handleUserMessage}
          >
            <input 
              type="text" 
              className="user-input" 
              placeholder="Talk to the bot."
              value={userMessage}
              onChange={({ target }) => setUserMessage(target.value)} />
            <span>
              <FaMicrophone onClick={initMic} />
            </span>
          </InputForm>
        </div>
      </ChatWrapper>
    </div>
  );

}

const ChatTitle = styled.h2`
color: #444;
font-family: Montserrat;
font-size: 2rem;
text-align: center;
margin-bottom: 40px;
margin-top: 60px;
`;

const ChatWrapper = styled.div`
max-width: 661px;
margin: 40px auto;
border: 1px solid #eee;
border-radius: 4px;
box-shadow: 0 4px 21px rgba(80,80,80,0.2);


.chat-output {
  flex: 1;
  padding: 20px;
  display: flex;
  background: white;
  flex-direction: column;
  overflow-y: auto;
  max-height: 65vh;

  > div {
    margin: 0 0 20px 0;
  }
  .user-message {
    .message {
      background: #0FB0DF;
      color: white;
    }
  }
  .bot-message {
    text-align: right;
    .message {
      background: #eee;
    }
  }
  .message {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 1rem;
    font-family: "Open Sans";
  }
}
.chat-input {
  padding: 20px;
  background: #ddd;

  .user-input {
    width: 100%;
    font-size: 1.1rem;
    border: none;
    outline: none;
    border-radius: 4px;
    padding: 8px;
  }
}
`;

const InputForm = styled.form`
display: flex;
justify-content: space-between;
align-items: center;

input {
  width: 85%;
}

span {
  text-align: center;
  color: hsl(213, 97%, 53%);
  font-size: 1rem;
  width: 15%;
}
`;