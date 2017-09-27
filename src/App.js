import React, { Component } from 'react';
import profilePic from './Jake_Gornall_Photo.jpg';
import './App.css';
import ChatApp from './ChatApp/ChatApp.js';
import SignInSignUp from './SignInSignUp/SignInSignUp.js';
import io from 'socket.io-client';
let socket = io('http://localhost:3001')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      isLoggedIn: false,
      sessionToken: null
    };
  }

  componentDidMount() {
    socket.on('server:sessionStatus', data => {
      this.setState(data);
      console.log(this.state);
      if (this.state.sessionToken) {
        if (window.localStorage) {
          window.localStorage.setItem('sessionToken', this.state.sessionToken);
        }
      } else {
        if (window.localStorage) {
          window.localStorage.removeItem('sessionToken');
        }
      }
    });

    if (window.localStorage.getItem('sessionToken')) {
      socket.emit('client:authenticate', window.localStorage.getItem('sessionToken'));
    }
  }

  render() {
    var mainContent = this.state.isLoggedIn ? <ChatApp socket={socket} /> : <SignInSignUp socket={socket} />;
    return (
      <div className="App">
        <div className="App-header">
          <img src={profilePic} className="profile-photo" alt="Jake Gornall" />
          <div className="header-title-container">
            <h2>Welcome to Jake Gornall's Portfolio!</h2>
            <h3>(Built on React, Express, Socket.io, and MongoDB)</h3>
          </div>
          <div className="menu-icons-container">
            <a href="tel:7404387924" className="contact-btn">✆</a>
            <a className="contact-btn">✉</a>
          </div>
        </div>
        {mainContent}
        <footer>
        </footer>
      </div>
    );
  }
}

export default App;
