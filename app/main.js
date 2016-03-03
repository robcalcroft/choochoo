import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import trainTimesApp from 'reducers';

// Components
import Home from 'routes/Home';

// Styles
import 'styles/main.scss';

ReactDOM.render(
    <Provider store={createStore(trainTimesApp)}>
        <Home />
    </Provider>,
    document.getElementById('react-hook')
);
