import React, { Component } from 'react';
import './SignInSignUp.css';

class SignInSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signin: {
        username: null,
        password: null,
        error: null
      },
      signup: {
        username: null,
        password: null,
        retypePassword: null,
        error: "",
        usernameAvailable: false
      }
    }

    this.handleSignInUsernameChange = this.handleSignInUsernameChange.bind(this);
    this.handleSignInPasswordChange = this.handleSignInPasswordChange.bind(this);
    this.signinSubmit = this.signinSubmit.bind(this);

    this.handleSignUpUsernameChange = this.handleSignUpUsernameChange.bind(this);
    this.handleSignUpPasswordChange = this.handleSignUpPasswordChange.bind(this);
    this.handleSignUpRetypePasswordChange = this.handleSignUpRetypePasswordChange.bind(this);
    this.signupSubmit = this.signupSubmit.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('server:checkExistingUsername', data => {
      if (!data.available) {
        this.setState({
          signup: {
            error: "Username already exists!",
            usernameAvailable: false,
            username: this.state.signup.username,
            password: this.state.signup.password,
            retypePassword: this.state.signup.retypePassword
          }
        });
      } else {
        this.setState({
          signup: {
            error: "",
            usernameAvailable: true,
            username: this.state.signup.username,
            password: this.state.signup.password,
            retypePassword: this.state.signup.retypePassword
          }
        });
      }
    });

    this.props.socket.on('server:signinError', data => {
      this.setState({ signin: { error: data.msg }});
    });
  }

  handleSignInUsernameChange(e) {
    this.setState({
      signin: {
        username: e.target.value,
        error: this.state.signin.error,
        password: this.state.signin.password
      }
    });
  }

  handleSignInPasswordChange(e) {
    this.setState({
      signin: {
        password: e.target.value,
        error: this.state.signin.error,
        username: this.state.signin.username
      }
    });
  }

  signinSubmit(e) {
    e.preventDefault();
    if (this.state.signin.username && this.state.signin.password) {
      this.props.socket.emit('client:signin', {
        username: this.state.signin.username,
        password: this.state.signin.password
      });
    }
  }

  handleSignUpUsernameChange(e) {
    this.setState({
      signup: {
        username: e.target.value,
        password: this.state.signup.password,
        retypePassword: this.state.signup.retypePassword,
        error: this.state.signup.error,
        usernameAvailable: this.state.signup.usernameAvailable
      }
    });
    this.props.socket.emit('client:checkExistingUsername', e.target.value);
  }

  handleSignUpPasswordChange(e) {
    if (e.target.value !== this.state.signup.retypePassword) {
      this.setState({
        signup: {
          error: "Passwords do not match!",
          username: this.state.signup.username,
          password: e.target.value,
          retypePassword: this.state.signup.retypePassword,
          usernameAvailable: this.state.signup.usernameAvailable
        }
      });
    } else {
      this.setState({
        signup: {
          error: "Passwords Match!",
          username: this.state.signup.username,
          password: e.target.value,
          retypePassword: this.state.signup.retypePassword,
          usernameAvailable: this.state.signup.usernameAvailable
        }
      });
    }
  }

  handleSignUpRetypePasswordChange(e) {
    if (e.target.value !== this.state.signup.password) {
      this.setState({
        signup: {
          error: "Password do not match!",
          username: this.state.signup.username,
          password: this.state.signup.password,
          retypePassword: e.target.value,
          usernameAvailable: this.state.signup.usernameAvailable
        }
      });
    } else {
      this.setState({
        signup: {
          error: "Passwords Match!",
          username: this.state.signup.username,
          password: this.state.signup.password,
          retypePassword: e.target.value,
          usernameAvailable: this.state.signup.usernameAvailable
        }
      });
    }
  }

  signupSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    if (this.state.signup.retypePassword === this.state.signup.password && this.state.signup.usernameAvailable) {
      this.props.socket.emit('client:signup', { username: this.state.signup.username, password: this.state.signup.password });
    }
  }

  render() {
    return (
      <div className="SignInSignUp">
        <form className="SignIn-form" onSubmit={this.signinSubmit} >
          <h3>Sign In</h3>
          <input type="text" name="username" placeholder="username" onChange={this.handleSignInUsernameChange} />
          <input type="password" name="password" placeholder="password" onChange={this.handleSignInPasswordChange} />
          <input type="submit" name="Submit" value="SignIn" />
          <p className="SignUp-error">{this.state.signin.error}</p>
        </form>
        <form className="SignUp-form" onSubmit={this.signupSubmit}>
          <h3>Sign Up</h3>
          <input type="text" name="username" placeholder="username" onChange={this.handleSignUpUsernameChange} />
          <input type="password" name="password" placeholder="password" onChange={this.handleSignUpPasswordChange} />
          <input type="password" name="verifyPassword" placeholder="retype password" onChange={this.handleSignUpRetypePasswordChange} />
          <input type="submit" name="Submit" value="SignUp" />
          <p className="SignUp-error">{this.state.signup.error}</p>
        </form>
      </div>
    );
  }
}

export default SignInSignUp;