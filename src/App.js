import React, { Component } from 'react';
import './App.css';
import fetch from 'isomorphic-fetch';
import propTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';

//Material-UI Modules
import { CircularProgress } from 'material-ui/Progress';
import 'typeface-roboto'

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100'

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const isSearched = (searchTerm) => (item) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

  }

  onSort = (sortKey) => {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  needsToSearchTopStories = searchTerm =>
    !this.state.results[searchTerm];

  setSearchTopStories = (result) => {
    const {hits, page} = result;
    this.setState(this.updateSearchTopStoriesState(hits, page));
  };

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true });

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(e => this.setState({ error: e }));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit = (event) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm })

    this.needsToSearchTopStories(searchTerm) && this.fetchSearchTopStories(searchTerm);

    event.preventDefault();
  }

  onDismiss = (id) => {
    this.setState(this.updateDismissStoriesState(id));
  };

  updateDismissStoriesState = (id) => (prevState) => {
    const { searchKey, results } = prevState;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    return {
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page },
      }
    };
  };

  updateSearchTopStoriesState = (hits, page) => (prevState) => {
    const { searchKey, results } = prevState;

    const oldHits = results && results[searchKey]
    ? results[searchKey].hits
    : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    return {
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false,
    };
  };

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
      sortKey,
      isSortReverse
    } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
          Search
          </Search>
          { error
            ? <div className='interactions'>
              <p>Something went wrong.</p>
            </div>
            : <Table
              list={list}
              sortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}
              onDismiss={this.onDismiss}
            />
          }
          <div className='interactions'>
            <ButtonWithLoading
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
              More
            </ButtonWithLoading>
          </div>
        </div>
      </div>
    );
  }
}

export class Search extends Component {

  componentDidMount() {
    this.input.focus();
  }

  render() {
    const {
      value,
      onChange,
      children,
      onSubmit,
    } = this.props;

    return (
      <form onSubmit={onSubmit}>
        {children}
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={ (node) => { this.input = node; }}
        />
        <Button type='submit'>
          {children}
        </Button>
      </form>
    );
  }
}

Search.propTypes = {
  value: propTypes.string,
  onChange: propTypes.func.isRequired,
  children: propTypes.node.isRequired,
  onSubmit: propTypes.func.isRequired,
}

export const Table = ({
  list,
  sortKey,
  onSort,
  onDismiss,
  isSortReverse
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;

  return(
    <div className='table'>
      <div className='table-header'>
        <span style={{ width: '40%' }}>
          <Sort
            sortKey={'TITLE'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
          Title
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
          Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
          Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'POINTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
          Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Archive
        </span>
      </div>
      { reverseSortedList.map(item =>
        <div className='table-row' key={item.objectID}>
          <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{ width: '30%' }}>
            {item.author}
          </span>
          <span style={{ width: '10%' }}>
            {item.num_comments}
          </span>
          <span style={{ width: '10%' }}>
            {item.points}
          </span>
          <span style={{ width: '10%' }}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}

Table.propTypes = {
  list: propTypes.arrayOf(
    propTypes.shape({
      objectID: propTypes.string.isRequired,
      author: propTypes.string,
      url: propTypes.string,
      num_comments: propTypes.num,
      points: propTypes.num,
    }).isRequired,
  ),
  onDismiss: propTypes.func.isRequired,
}

export const Button = ({onClick, className = '', children,}) =>
  <button
    onClick={onClick}
    className={className}
    type='button'
  >
    {children}
  </button>

Button.propTypes = {
  onClick: propTypes.func.isRequired,
  className: propTypes.string,
  children: propTypes.node.isRequired,
};

const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component { ...rest } />


const Loading = () =>
  <CircularProgress />

const ButtonWithLoading = withLoading(Button);

const Sort = ({
  sortKey,
  activeSortKey,
  onSort,
  children
}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active' : sortKey === activeSortKey }
  );

  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children}
    </Button>
  );
}

export default App;
