import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyWidget from './my_widget/myWidget';
import io from 'socket.io-client';
let socket = io('http://localhost:3001')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      names: [],
      inputValue: '',
      formStyle: {
        width: 75
      }
    };

    this.submitForm = this.submitForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formFocus = this.formFocus.bind(this);
    this.formBlur = this.formBlur.bind(this);
  }

  componentDidMount() {
    socket.on('server:event', data => {
      console.log(data);
      this.setState({ 
        names: data.names,
        inputValue: this.state.inputValue,
        formStyle: this.state.formStyle
      });
    });
  }

  submitForm(e) {
    e.preventDefault();
    this.state.names.push(this.state.inputValue);
    socket.emit('client:sentMessage', this.state.inputValue);
    this.setState({
      names: this.state.names,
      inputValue: '',
      formStyle: {
        width: 75
      }
    });
  }

  handleChange(e) {
    var len = e.target.value.length * 7 > 200 ? e.target.value.length * 7 : 200;
    this.setState({names: this.state.names, inputValue: e.target.value, formStyle: {width: len}});
  }

  formFocus(e) {
    e.preventDefault();
    this.setState({names: this.state.names, inputValue: e.target.value, formStyle: {width: 200}});
  }

  formBlur(e) {
    e.preventDefault();
    this.setState({names: this.state.names, inputValue: e.target.value, formStyle: {width: 75}});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Jake Gornall's Portfolio! (Built on React and Express)</h2>
        </div>
        <form className="name-form" onSubmit={this.submitForm}>
          <input
            id="name-input"
            type="text"
            style={this.state.formStyle}
            placeholder="Enter a name"
            value={this.state.inputValue}
            onChange={this.handleChange}
            onFocus={this.formFocus}
            onBlur={this.formBlur}
          />
          <button type="submit">Add</button>
        </form>
        <div className="widget-container">
        {this.state.names.map((name, i) =>
          <MyWidget key={i} name={name} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
