import './App.css';
import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://127.0.0.1:5000')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {name: '', queue: [], queueing: false, errors: [], found: false}
    this.enterQueue = this.enterQueue.bind(this);
    this.leaveQueue = this.leaveQueue.bind(this);
  }

  componentWillMount() {
    client.onmessage = (message) => {
      let data = JSON.parse(message.data);
      if (data.type === 'updateQueue') {
        this.setState({queue: data.queue});
      }
      if (data.type === 'foundQueue') {
        this.setState({queue: data.queue, found: true})
        client.close()
      }
    }
  }

  enterQueue(e) {
    e.preventDefault();
    if (this.state.name !== '') {
      client.send(JSON.stringify({type: 'enter', name: this.state.name}))
    }
    this.setState({queueing: true});
  }

  leaveQueue(e) {
    e.preventDefault(); 
    if (this.state.queueing == true) {
      client.send(JSON.stringify({type: 'leave'}))
      this.setState({queueing: false});
    }
  }

  render() {
    return (
      <div className="App">
        {!this.state.found ? 
        <div>
          <p>Current Queue</p>
          <ul style={{listStyle: 'none'}}>
            {this.state.queue.map((name, index) => {return <li key={index}>-{name}</li>})}
          </ul>
          <div>
            <span>Username </span>
            <input type="text" value={this.state.name} onChange={(e) => this.setState({name: e.target.value})} />
          </div>
          <button onClick={this.enterQueue}>{this.state.queueing ? 'Change Name' : 'Enter Queue'}</button>
          <button onClick={this.leaveQueue}>Leave Queue</button>
        </div>
        : <div>
            <p>My party</p>
            {this.state.queue.map((name, index) => {
            return (
            <li key={index}>
              <a href={`https://na.op.gg/summoner/userName=${name}`} target="_blank">{index}: {name}</a>
            </li>
            )})}
          </div>}
      </div>
    )
  }
}

export default App;
