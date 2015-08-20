react-router-relay
=========================
Nested react-router routes for Relay

    $ npm install --save react-router-relay

After you've installed it, add it as a root `<Route>` to your
react-router@>=1.0.0-beta3 routes like so:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import reactRouterRelay from 'react-router-relay';

/* ... */

ReactDOM.render((
  <Router history={new BrowserHistory()} createElement={reactRouterRelay()}>
    <Route component={App} queries={AppQueries}>
      <Route path="/" component={Dashboard} queries={DashboardQueries}/>
    </Route>
  </Router>
), document.getElementById('react-root'));
```

Define an object containing your queries that a particular `Relay.Container`
needs and add it as a `queries` prop to any container `<Route/>`s:

```js
var AppQueries = {
  viewer: (Component) => Relay.QL`
    viewer {
      ${Component.getFragment('viewer')}
    }
  `
};
```

`react-router-relay` will automatically generate a component that includes all
of your fragments, and a route that includes all of your root queries,
and dispatch/render everything in one go.

You can also pass props like `renderLoading` by adding them as props to
your routes.

# Special Thanks

[@cpojer](https://github.com/cpojer)

[@taion](https://github.com/taion)
