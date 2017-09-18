import React, { Component } from 'react';
import logo from '../logo.svg';
import './my-widget.css';

class MyWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: props.message,
      editMode: false
    };

    this.socket = props.socket;
    this.delete = this.delete.bind(this);
  }

  delete(e) {
    e.preventDefault();
    this.socket.emit('client:deleteMessage', this.state.message);
  }

  render() {
    return (
      <div className="my-widget">
        <header className="my-widget-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3 className="my-widget-sender" >{this.state.message.sender}</h3>
          <p className="my-widget-date">{this.state.message.date}</p>
        </header>
        <p className="my-widget-message">{this.state.message.body}</p>
        <button onClick={this.delete} >Delete</button>
      </div>
    );
  }
}

export default MyWidget;