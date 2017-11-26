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
    style: {
      color: '#000000',
      fontSize: 10,
    }
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
    style: {
      color: '#000000',
      fontSize: 10,
    }
  },
  {
    title: 'Flux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 2,
    style: {
      color: '#000000',
      fontSize: 10,
    }
  },
  {
    title: 'Inferno',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 5,
    points: 5,
    objectID: 3,
    style: {
      color: '#000000',
      fontSize: 10,
    }
  },
  {
    title: 'Meteor',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 3,
    points: 5,
    objectID: 4,
    style: {
      color: '#000000',
      fontSize: 10,
    }
  },
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list,
    };
    this.increaseFontSize = this.increaseFontSize.bind(this);
    this.resetFontSize = this.resetFontSize.bind(this);
    this.randomColor = this.randomColor.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  increaseFontSize(id) {
    const updatedList = this.state.list.reduce((itemList, item) => {
      if (item.objectID === id) {
        item.style.fontSize *= 2;
      }
      itemList.push(item);
      return itemList;
    },[]);
    this.setState({list: updatedList});
  }

  resetFontSize(id) {
    const updatedList = this.state.list.reduce((itemList, item) => {
      if (item.objectID === id) {
        item.style.fontSize = 10;
      }
      itemList.push(item);
      return itemList;
    },[]);
    this.setState({list: updatedList});
  }

  randomColor(id) {
    const randomHex = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    const updatedList = this.state.list.reduce((itemList, item) => {
      if (item.objectID === id) {
        item.style.color = randomHex;
      }
      itemList.push(item);
      return itemList;
    },[]);
    this.setState({list: updatedList});
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.list.filter(isNotId);
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
            <span style={{color: item.style.color, fontSize: item.style.fontSize, transition: '0.5s',}}>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <button onClick={() => this.onDismiss(item.objectID)} type='button'>Dismiss</button>
            <button onClick={() => this.increaseFontSize(item.objectID)}>Current Size: { item.style.fontSize }</button>
            <button onClick={() => this.randomColor(item.objectID)}>Current Color: { item.style.color }</button>
            <button onClick={() => this.resetFontSize(item.objectID)}>Reset</button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
