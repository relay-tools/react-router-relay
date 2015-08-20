react-router-relay
=========================
Nested react-router routes for Relay

    $ npm install --save react-router-relay

Afterwards, add it as the `createElement` of your react-router@>=1.0.0-beta3
`<Router>` like so:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import * as ReactRouterRelay from 'react-router-relay';

/* ... */

ReactDOM.render((
  <Router
      history={new BrowserHistory()}
      createElement={ReactRouterRelay.createElementFunction()}
  >
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

# RootContainer Props

You can pass props like `renderLoading` by adding them to a
`rootContainerProps` prop on your routes:

```js
var customContainerProps = {
  renderLoading: () => <Loading />; // Render a Loading component
};

/* ... */

<Route {/* ... */} rootContainerProps={customContainerProps} />
```

# Query Parameters

You can specify an array of query parameters as a `queryParams` prop to specify
which parameters should be passed in from the router and made available as
variables to your root queries and containers:

```js
<Route
  path='/widgets'
  component={Widgets}
  queries={WidgetsQueries}
  queryParams={['date', 'color']} // date and color will be passed as variables
/>`
```

# Special Thanks

[@cpojer](https://github.com/cpojer)

[@taion](https://github.com/taion)
