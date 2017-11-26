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
  {
    title: 'Flux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 2,
  },
  {
    title: 'Inferno',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 5,
    points: 5,
    objectID: 3,
  },
  {
    title: 'Meteor',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 3,
    points: 5,
    objectID: 4,
  },
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list,
      fontSize: 10,
      color: '#000000',
    };
    this.increaseFontSize = this.increaseFontSize.bind(this);
    this.resetFontSize = this.increaseFontSize.bind(this);
    this.randomColor = this.increaseFontSize.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  increaseFontSize() {
    this.setState({fontSize: this.state.fontSize * 2});
  }

  resetFontSize() {
    this.setState({fontSize: 10});
  }

  randomColor() {
    const randomHex = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    this.setState({color: randomHex});
  }

  onDismiss(id) {
    const isNotID = (item) => {
      return item.ObjectID !== id;
    }

    const updatedList = {this.state.list.filter(isNotId)};
    this.setState({list: updatedList});
  }

  render() {
    return (
      <div className="App">
        { this.state.list.map(item =>
          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{color: this.state.color, fontSize: this.state.fontSize, transition: '0.5s',}}>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <button onClick={() => this.onDismiss(item.ObjectID)}>Dismiss</button>
            <button onClick={this.increaseFontSize}>Current Size: { this.state.fontSize }</button>
            <button onClick={this.randomColor}>Current Color: { this.state.color }</button>
            <button onClick={this.resetFontSize}>Reset</button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
