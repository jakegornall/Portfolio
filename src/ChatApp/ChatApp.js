import React, { Component } from 'react';
import './ChatApp.css';
import RoomApp from './RoomApp/RoomApp.js';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: this.props.rooms,
      currentRoom: this.props.rooms[0].room,
      chatRequests: [],
      availableUsers: []
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
      console.log(data);
      rooms.push(data);
      this.setState({ rooms: rooms, currentRoom: data.room });
    });

    this.props.socket.on("server:availableUsers", data => {
      this.setState({ availableUsers: data });
    });
  }

  acceptRequest(request, i) {
    this.props.socket.emit("client:acceptchatrequest", request);
    var requests = this.state.chatRequests.slice();
    requests.pop(i);
    this.setState({
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
        <div key={i} className="chat-request">
          <p className="chat-request-msg">{request.user} wants to chat!</p>
          <p className="accept-chat" onClick={this.acceptRequest.bind(this, request, i)}>Accept</p>
          <p className="decline-chat">Decline</p>
        </div>
      );
    });

    var rooms = this.state.rooms.map((room, i) => {
      return (
        <div key={i} className="room-tab" onClick={this.selectRoom.bind(this, room.room)}>
          <p>{room.user}</p>
        </div>
      );
    });

    var availableUsers = this.state.availableUsers.map((user, i) => {
      if (user.username !== this.props.username) { 
        return (
          <div key={i} className="available-user" onClick={this.requestChat.bind(this, user.username)}>
            <p>{user.username}</p>
          </div>
        );
      } else {
        return null;
      }
    });

    return (
      <div className="Chat-App">
        <div className="chat-requests">
          {requests}
        </div>
        <div className="room-tabs">
          {rooms}
        </div>
        <RoomApp room={this.state.currentRoom} socket={this.props.socket} sessionToken={this.props.sessionToken} />
        <div className="available-users">
          {availableUsers}
        </div>
      </div>
    );
  }
}

export default ChatApp;