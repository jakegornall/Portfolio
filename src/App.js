import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
import MessageWidget from './my_widget/myWidget';
let socket = io('http://localhost:3001')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      inputValue: ''
    };

    this.submitForm = this.submitForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formFocus = this.formFocus.bind(this);
    this.formBlur = this.formBlur.bind(this);
  }

  componentDidMount() {
    socket.on('server:event', data => {
      this.setState({ messages: data, inputValue: this.state.inputValue });
    });
  }

  submitForm(e) {
    e.preventDefault();
    this.state.messages.push(this.state.inputValue);
    socket.emit('client:sentMessage', {
      sender: "Jake Gornall",
      body: "Hello, This is a message!"
    });
  }

  handleChange(e) {
    this.setState({messages: this.state.messages, inputValue: e.target.value});
  }

  formFocus(e) {
    e.preventDefault();
    this.setState({messages: this.state.messages, inputValue: e.target.value});
  }

  formBlur(e) {
    e.preventDefault();
    this.setState({messages: this.state.messages, inputValue: e.target.value});
  }

  render() {
    const messageList = this.state.messages.map((msg, i) =>
      <MessageWidget message={msg} key={i} socket={socket} />
    );
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Jake Gornall's Portfolio! (Built on React, Express, Socket.io, and MongoDB)</h2>
        </div>
        <form className="name-form" onSubmit={this.submitForm}>
          <input
            id="name-input"
            type="text"
            placeholder="Enter a name"
            value={this.state.inputValue}
            onChange={this.handleChange}
            onFocus={this.formFocus}
            onBlur={this.formBlur}
          />
          <button type="submit">Add</button>
        </form>
        <section className="widget-container">
          { messageList }
        </section>
      </div>
    );
  }
}

export default App;
