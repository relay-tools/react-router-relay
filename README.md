relay-nested-routes
=========================
Nested react-router views for Relay

    $ npm install --save relay-nested-routes

After you've installed it, add it as a root `<Route>` to your react-router@>=1.0.0-beta2 routes like so:

```js
var React  = require('react'),
    ReactDOM = require('react-dom'),
    Relay  = require('react-relay');

var NestedRootContainer = require('relay-nested-routes')(React, Relay);

/* ... */

ReactDOM.render((
  <Router history={new BrowserHistory()}>
    <Route component={NestedRootContainer}>
      <Route component={App} route={AppRoute}>
        <Route path="/" component={Dashboard} route={DashboardRoute}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('react-root'));
```

Define a `Relay.Route` that contains just the data that a particular `Relay.Container` needs and add it as a `route` prop to any container `<Route/>`s.

relay-nested-routes will automatically generate a component that includes all of your fragments, and a route that includes all of your root queries, and dispatch/render everything in one go.

# Todo

* Passing react-router props to rendered components
* Named react-router components