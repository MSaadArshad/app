import React, { Component } from "react";
import './App.css';

class App extends Component {

  state = {
    difference: null,
    time: null,
    metrics: null
  };

  componentDidMount() {

    // Gets most recently fetched value for server time by calling getTime() function
    this.getTime()
      .then(res => {
        this.setState({ time: res.epoch });
        if (this.state.time) {
          this.getDifference(this.state.time); // calls the getDifference() function
        }
      })
      .catch(err => console.log(err));

    // Gets the difference between server and client time every second by calling the getDifference() function
    setInterval(() => {
      this.getDifference(this.state.time);
    }, 1000);

    // Gets most recently fetched value for prometheus metrics
    this.getMetrics()
      .then(res => this.setState({ metrics: res }))
      .catch(err => console.log(err));

    // Makes API requests every 30 seconds 
    setInterval(() => {
      this.getTime()
        .then(res => this.setState({ time: res.epoch }))
        .catch(err => console.log(err));

      this.getMetrics()
        .then(res => this.setState({ metrics: res }))
        .catch(err => console.log(err));
    }, 30000);

  }

  // Calls the /time endpoint to get server epoch seconds
  getTime = async () => {
    const response = await fetch('/time', {
      headers: {
        'Authorization': 'mysecrettoken'
      }
    });
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  };

  // Gets the difference between client and server time in epoch seconds
  getDifference(serverTime) {
    var date = new Date(); // gets current epoch date
    var dateinSeconds = Math.round(date.getTime() / 1000); // gets epoch seconds for current client machine time
    var differenceInTime = dateinSeconds - serverTime; // substracts the difference between client time and server time
    const result = new Date(differenceInTime * 1000).toISOString().slice(11, 19); // converts the difference to stopwatch format
    this.setState(
      { difference: result })
  }

  // Calls the /metrics endpoint to get all prometheus metrics for the API
  getMetrics = async () => {
    const response = await fetch('/metrics', {
      headers: {
        'Authorization': 'mysecrettoken'
      }
    });
    const body = await response.text();
    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              {
                !this.state.time || !this.state.difference ?
                  <div><p>Loading...</p></div>
                  :
                  <div>
                    <h6>{"The most recently-fetched value for server time in epoch seconds: " + this.state.time}</h6>
                    <h6>{"The difference between current client machine time and the most recently-fetched value for server time in epoch seconds: " + this.state.difference}</h6>
                  </div>
              }
            </div>
            <div style={{ border: '1px solid' }}></div>
            <div>
              {
                !this.state.metrics ?
                  <div><p>Loading...</p></div>
                  :
                  <div>
                    <h6><pre>{this.state.metrics}</pre></h6>
                  </div>
              }
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
