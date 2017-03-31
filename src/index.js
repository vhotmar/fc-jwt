import React, {Component} from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';

const logger = createLogger();

const authReducer = (state = { authenticated: false, authenticating: false, }, action) => {
    switch (action.type) {
        case 'authenticated':
            return {
                authenticated: true,
                authenticating: false,
                token: action.payload.token,
                user: action.payload.user
            };

        case 'logout':
            return {
                authenticated: false,
                authenticating: false
            };

        case 'authenticating':
            return {
                ...state,
                authenticating: true
            }

        default:
            return state;
    }
}

const secretReducer = (state = {loading: false, data: null}, action) => {
    switch (action.type) {
        case 'secret.loading':
            return {
                loading: true,
                data: null
            };

        case 'secret.success':
            return {
                loading: false,
                data: action.payload.data
            }
        
        default:
            return state;
    }
}

const reducers = combineReducers({
    auth: authReducer,
    secret: secretReducer
});

const loginAction = (provider) => (dispatch) => {
    const providers = ['steam', 'facebook'];

    if (providers.indexOf(provider) == -1) return;

    dispatch({type: 'authenticating'});

    window.open(`/auth/${provider}`, '_blank');

    window.onLogin = (token, user) => {
        window.onLogin = null;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({type: 'authenticated', payload: {token, user}});
    }
};

const logoutAction = () => {
    localStorage.setItem('token', null);
    localStorage.setItem('user', null);

    return {
        type: 'logout'
    }
};

const getSecretAction = (token) => (dispatch) => {
    dispatch({type: 'secret.loading'})

    fetch('/api/secure', {headers: {'Authorization': 'JWT ' + token}})
        .then(x => x.json())
        .then(data => dispatch({type: 'secret.success', payload: {data}}))
        .catch(err => {
            console.error(err);

            dispatch(logoutAction());
        })
}

const getState = () => {
    try {
        if (localStorage.getItem('token') == null)
            return {};

        return {
            auth: {
                authenticated: true,
                authenticating: false,
                token: localStorage.getItem('token'),
                user: JSON.parse(localStorage.getItem('user'))
            }
        }
    } catch(e) {
        return {};
    }
}

const store = compose(applyMiddleware(thunk, logger))(createStore)(reducers, getState());

const AuthenticatedPage = (() => {
    class CComponent extends Component {
        componentWillMount() {
            this.props.getSecretAction(this.props.token);
        }

        render() {
            const {user, secret, loading} = this.props;

            return (
                loading ? <span>Secret: loading</span> : <span>Secret: ${JSON.stringify(secret)}</span>
            );
        }
    }

    const enhance = connect(
        (state) => ({user: state.auth.user, secret: state.secret.data, loading: state.secret.loading, token: state.auth.token}),
        {getSecretAction}
    );

    return enhance(CComponent);
})();

const Page = (() => {
    const Component = ({authenticated, loginAction}) => authenticated ? (
        <div>
            <p>Authenticated</p>
            <AuthenticatedPage />
        </div>
    ) : (
        <div>
            <p>Not authenticated</p>
            <p><a href="#" onClick={() => loginAction('steam')}>Steam</a></p>
            <p><a href="#" onClick={() => loginAction('facebook')}>Facebook</a></p>
        </div>
    );

    const enhance = connect(
        (state) => ({authenticated: state.auth.authenticated}),
        {loginAction}
    );

    return enhance(Component);
})();

const App = ({store}) => (
    <Provider store={store}>
        <Page />
    </Provider>
);

render(<App store={store} />, document.querySelector('#app'));
