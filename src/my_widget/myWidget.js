import React, { Component } from 'react';
import logo from '../logo.svg';
import './my-widget.css';

class MyWidget extends Component {
  constructor(props) {
    super(props);
    this.localStorageEnabled = typeof(Storage) !== "undefined";
    this.state = {
      name: props.name,
      id: props.id,
      editMode: false,
      formStyle: {
        width: props.name.length > 0 ? props.name.length * 10 : 75
      }
    };

    console.log(props);

    this.handleChange = this.handleChange.bind(this);
    this.submitName = this.submitName.bind(this);
    this.showForm = this.showForm.bind(this);
    this.setLocalStorage = this.setLocalStorage.bind(this);
  }

  setLocalStorage() {
    if (this.localStorageEnabled) {
      var names = JSON.parse(localStorage.getItem("names"));
      names[this.state.id] = this.state.name;
      localStorage.setItem("names", JSON.stringify(names));
    }
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
      editMode: true,
      nameChanged: true,
      formStyle: {
        width: e.target.value.length > 0 ? e.target.value.length * 10 : 75
      }
    });
  }

  submitName(e) {
    e.preventDefault();
    this.setState({
      name: this.state.name,
      editMode: false,
      nameChanged: false,
      formStyle: this.state.formStyle
    });
  }

  delete(e) {
    e.preventDefault();
  }

  showForm(e) {
    console.log(this);
    this.setState({
      name: this.state.name,
      editMode: true,
      nameChanged: false,
      formStyle: this.state.formStyle
    });
  }

  render() {

    const showHideForm = {
      'display': this.state.editMode ? 'block' : 'none'
    };

    const showHideName = {
      'display': this.state.editMode ? 'none' : 'block'
    };

    const buttonText = this.state.nameChanged ? 'Change Name' : 'Cancel';

    return (
      <div className="my-widget" onClick={this.showForm}>
          <img src={logo} className="App-logo" alt="logo" />
          <h3 className="my-widget-name" style={showHideName} >{this.state.name}</h3>
          <p style={showHideName} >click to edit...</p>
          <form onSubmit={this.submitName} style={showHideForm} >
            <input type="text" style={this.state.formStyle} value={this.state.name} onChange={this.handleChange} />
            <button type="submit">{buttonText}</button>
            <button onClick={this.delete} >Delete</button>
          </form>
      </div>
    );
  }
}

export default MyWidget;