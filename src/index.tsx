import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
// import { render } from 'react-dom';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Below, the alias 'ReduxDevtools' is pointing to 'src/utilities/redux-devtools/extension.ts' file.
// This is configured in 'webpack.config.js' file.
// We only want to import the `redux-devtools/extension` code when in 'development' mode.
import { composeWithDevTools } from 'ReduxDevtools'; // eslint-disable-line import/no-unresolved

import rootReducer from './store/reducers/rootReducer';

import App from './App';

console.log(`process.env.REACT_APP_BASE_URL = '${process.env.REACT_APP_BASE_URL}'`); // eslint-disable-line no-console
console.log(`process.env.REACT_APP_API_URL = '${process.env.REACT_APP_API_URL}'`); // eslint-disable-line no-console
console.log(`process.env.NODE_ENV = '${process.env.NODE_ENV}'`); // eslint-disable-line no-console

let store;
if (process.env.NODE_ENV === 'development') {
  const composeEnhancers = composeWithDevTools({
    // Specify here name, actionsDenylist, actionsCreators and other options
    features: {
      pause: true, // start/pause recording of dispatched actions
      lock: true, // lock/unlock dispatching actions and side effects
      persist: true, // persist states on page reloading
      export: true, // export history of actions in a file
      import: 'custom', // import history of actions from a file
      jump: true, // jump back and forth (time travelling)
      skip: true, // skip (cancel) actions
      reorder: true, // drag and drop actions in the history list
      dispatch: true, // dispatch custom actions or action creators
      test: true, // generate tests for the selected actions
    },
  });

  store = createStore(rootReducer, composeEnhancers());
} else {
  store = createStore(rootReducer);
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Did not find element with id "root".');
}

// Create a root.
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
