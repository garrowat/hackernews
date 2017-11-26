import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list,
      fontSize: 10,
    };

  }

  increaseFontSize = () => {
    this.setState({fontSize: this.state.fontSize * 2});
  }

  resetFontSize = () => {
    this.setState({fontSize: 10});
  }

  render() {
    return (
      <div className="App">
        { this.state.list.map(item =>
          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{fontSize: this.state.fontSize, transition: '0.5s',}}>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <button onClick={this.increaseFontSize}>Current Size: { this.state.fontSize }</button>
            <button onClick={this.resetFontSize}>Reset</button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
