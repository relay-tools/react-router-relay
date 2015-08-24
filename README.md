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
import { Router, Route } from 'react-router';

import ReactRouterRelay from 'react-router-relay';

/* ... */

ReactDOM.render((
  <Router
      history={new BrowserHistory()}
      createElement={ReactRouterRelay.createElementFunction()}
  >
    <Route component={App} name="App" queries={AppQueries}>
      <Route path="/" component={Dashboard} name="Dashboard" queries={DashboardQueries}/>
    </Route>
  </Router>
), document.getElementById('react-root'));
```

Define an object containing the queries that a particular `Relay.Container`
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

`react-router-relay` will create RootContainers for any Relay.Container found
and fetch your routes in parallel, instead of in serial.

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

**Note:** The signature for `renderFetched`, `renderLoading`, and
`renderFailure` are the same as Relay, except that they also include the
`Component` and `props` from react-router's `createElement`.

# Variables

Any parameters defined by your routes `path` prop will be passed into your
query as a variable. You must opt-in to query parameters by passing in an array
of names as a `queryParams` prop:

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
