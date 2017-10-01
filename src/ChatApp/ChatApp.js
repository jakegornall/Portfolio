import React, { Component } from 'react';
import './ChatApp.css';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: this.props.rooms,
      currentRoom: null,
      chatRequests: []
    }
  }

  componentDidMount() {
    this.props.socket.on("newchatrequest", data => {
      var requests = this.state.chatRequests.slice();
      requests.push(data);
      this.setState({ chatRequests: requests});
    });

    this.props.socket.on("server:joinedroom", data => {
      var rooms = this.state.rooms.slice();
      rooms.push(data);
      this.setState({ rooms: rooms, currentRoom: data.room });
    });
  }

  acceptRequest(request, i) {
    this.props.socket.emit("client:acceptchatrequest", request);
    var rooms = this.state.rooms.slice();
    rooms.push(request);
    var requests = this.state.chatRequests.slice();
    requests.pop(i);
    this.setState({
      rooms: rooms,
      currentRoom: request.room,
      chatRequests: requests
    });
  }

  requestChat(user) {
    this.props.socket.emit("client:requestChat", user);
  }

  selectRoom(room) {
    this.setState({ currentRoom: room });
  }

  render() {
    var requests = this.state.chatRequests.map((request, i) => {
      return (
        <div className="chat-request">
          <p className="chat-request-msg">{request.user} wants to chat!</p>
          <p className="accept-chat" onClick={this.acceptRequest.bind(this, request, i)}>Accept</p>
          <p className="decline-chat">Decline</p>
        </div>
      );
    });

    var rooms = this.state.rooms.map((room, i) => {
      return (
        <div key={i} className="room-tab" onClick={this.selectRoom.bind(this, room.room)}>
          <p>Tab: {room.user}</p>
        </div>
      );
    });

    return (
      <div className="ChatApp">
        <div className="chat-requests">
          {requests}
        </div>
        <div className="room-tabs">
          {rooms}
        </div>
        <p>Current Room: {this.state.currentRoom}</p>
        <button onClick={this.requestChat.bind(this, "jessispencer")}>Request</button>
      </div>
    );
  }
}

export default ChatApp;