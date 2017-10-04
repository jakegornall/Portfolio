import React, { Component } from 'react';
import './RoomApp.css';


class RoomApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    this.props.socket.on("server:getroomdata", data => {
      console.log(data);
      this.setState({ messages: data.messages });
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    this.props.socket.emit("client:getroomdata", {
      roomId: nextProps.room,
      sessionToken: this.props.sessionToken
    });
  }

  render() {
    var messages = this.state.messages.map((msg, i) => {
      return (
        <div key={i} className="message">
          <div className="message-header">
            <p>{msg.sender}</p>
            <p>{msg.date}</p>
          </div>
          <pre>{msg.body}</pre>
        </div>
      );
    });
    return (
      <div className="Room-App">
        {messages}
      </div>
    );
  }
}

export default RoomApp;