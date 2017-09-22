import React, { Component } from 'react';
import logo from '../logo.svg';
import './my-widget.css';

class MyWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false
    };

    this.delete = this.delete.bind(this);
  }

  delete(e) {
    e.preventDefault();
    this.props.socket.emit('client:deleteMessage', this.props.message);
  }

  render() {
    var date = new Date(this.props.message.date);
    var formattedDate = date.toDateString();
    var time = date.toLocaleTimeString();
    return (
      <div className="my-widget">
        <header className="my-widget-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="title-container">
            <h3 className="my-widget-sender" >{this.props.message.sender}</h3>
            <p className="my-widget-date">{formattedDate}</p>
            <p className="my-widget-time">{time}</p>
          </div>
        </header>
        <pre className="my-widget-message">{this.props.message.body}</pre>
        <button onClick={this.delete}>X</button>
      </div>
    );
  }
}

export default MyWidget;