import React, { Component } from 'react';
import profilePic from './Jake_Gornall_Photo.jpg';
import './App.css';
import io from 'socket.io-client';
import MessageWidget from './my_widget/myWidget';
let socket = io('http://localhost:3001')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      senderInput: '',
      bodyInput: ''
    };

    this.submitForm = this.submitForm.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
  }

  componentDidMount() {
    socket.on('server:event', data => {
      this.setState({ messages: data, senderInput: this.state.senderInput });
    });
  }

  submitForm(e) {
    e.preventDefault();
    socket.emit('client:sentMessage', {
      sender: this.state.senderInput,
      body: this.state.bodyInput
    });
    this.setState({ messages: this.state.messages, senderInput: '', bodyInput: ''});
  }

  handleNameChange(e) {
    this.setState({messages: this.state.messages, senderInput: e.target.value, bodyInput: this.state.bodyInput});
  }

  handleBodyChange(e) {
    this.setState({messages: this.state.messages, senderInput: this.state.senderInput, bodyInput: e.target.value});
  }

  render() {
    var messageList = this.state.messages.map((msg) =>
      <MessageWidget message={msg} key={msg._id} socket={socket} />
    );
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
        <section className="widget-container">
          { messageList }
        </section>
        <form className="name-form" onSubmit={this.submitForm}>
          <input
            type="text"
            placeholder="Enter a name"
            value={this.state.senderInput}
            onChange={this.handleNameChange}
          />
          <textarea id="message-input" onChange={this.handleBodyChange} value={this.state.bodyInput} />
          <button type="submit">Add</button>
        </form>
        <footer>
        </footer>
      </div>
    );
  }
}

export default App;
