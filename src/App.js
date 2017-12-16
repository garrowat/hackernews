import React, { Component } from 'react';
import './App.css';
import fetch from 'isomorphic-fetch';
import propTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';

//Material-UI (MUI) Modules
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import 'typeface-roboto'
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Icon from 'material-ui/Icon';
import MuiButton from 'material-ui/Button';
import orange from 'material-ui/colors/orange';
import grey from 'material-ui/colors/green';
import red from 'material-ui/colors/red';

//MUI styles
const theme = createMuiTheme({
  palette: {
    primary: grey, // Purple and green play nicely together.
    secondary: orange,
    error: red,
  },
});

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
    margin: 'auto',
    marginTop: '10px',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
    align: 'center'
  },
  interactions: {
    display: 'flex',
    flexWrap: 'wrap',
  },

});

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '25'

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
    const { classes } = this.props;

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
      <MuiThemeProvider theme={theme}>
        <div className={classes.container}>
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
            classes={classes}
          >
            <Icon>search</Icon>
          </Search>
          { error
            ? <div className='interactions'>
              <p>Something went wrong.</p>
            </div>
            : <ContentTableWithStyles
              list={list}
              sortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}
              onDismiss={this.onDismiss}
              classes={classes}
            />
          }
          <div className={classes.container}>
            <MuiButtonWithLoading
              dense
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
              classes={classes.button}>
                <Icon>arrow_downward</Icon>
            </MuiButtonWithLoading>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export class Search extends Component {

  render() {
    const {
      value,
      onChange,
      children,
      onSubmit,
      classes
    } = this.props;

    return (
      <form className={classes.container} noValidate autoComplete="off" onSubmit={onSubmit}>
        <TextField
          id='search'
          label='Search'
          className={classes.textField}
          margin='normal'
          value={value}
          onChange={onChange}
        />
        <MuiButton dense type='submit' className={classes.button} color="accent">
          {children}
        </MuiButton>
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

export const ContentTable = ({
  list,
  sortKey,
  onSort,
  onDismiss,
  isSortReverse,
  classes
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;

  return(
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Sort
                sortKey={'TITLE'}
                onSort={onSort}
                activeSortKey={sortKey}
              >
              Title
              </Sort>
            </TableCell>
            <TableCell>
              <Sort
                sortKey={'AUTHOR'}
                onSort={onSort}
                activeSortKey={sortKey}
              >
              Author
              </Sort>
            </TableCell>
            <TableCell>
              <Sort
                sortKey={'COMMENTS'}
                onSort={onSort}
                activeSortKey={sortKey}
              >
              Comments
              </Sort>
            </TableCell>
            <TableCell>
              <Sort
                sortKey={'POINTS'}
                onSort={onSort}
                activeSortKey={sortKey}
              >
              Points
              </Sort>
            </TableCell>
            <TableCell>
              Archive
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { reverseSortedList.map(item =>
            <TableRow key={item.objectID}>
              <TableCell>
                <a href={item.url}>{item.title}</a>
              </TableCell>
              <TableCell>
                {item.author}
              </TableCell>
              <TableCell numeric>
                {item.num_comments}
              </TableCell>
              <TableCell >
                {item.points}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => onDismiss(item.objectID)}
                  className="button-inline"
                >
                  Dismiss
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

ContentTable.propTypes = {
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

const MuiButtonWithLoading = withLoading(MuiButton);

const ButtonWithLoading = withLoading(Button);

const ContentTableWithStyles = withStyles(styles)(ContentTable);

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

export default withStyles(styles)(App);
