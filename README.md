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
import BrowserHistory from 'react-router/lib/BrowserHistory';
import ReactRouterRelay from 'react-router-relay';

/* ... */

ReactDOM.render((
  <Router
    history={new BrowserHistory()}
    createElement={ReactRouterRelay.createElement}
  >
    <Route component={App} queries={AppQueries}>
      <Route path="/" component={Dashboard} queries={DashboardQueries} />
      {/* URL params from react-router are passed directly to your query.      */}
      {/* Query params are available too, but must be whitelisted (see below). */}
      <Route path="/widget/:widgetID" component={Widget} queries={WidgetQueries} />
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

# Render Callbacks

You can pass in custom `renderLoading`, `renderFetched`, and `renderFailure`
callbacks to your routes:

```js
<Route {/* ... */} renderLoading={() => <Loading />} />
```

These have the same signature and behavior as they do on `Relay.RootContainer`,
except that the argument to `renderFetched` also includes the injected props
from React Router. As on `Relay.RootContainer`, the `renderLoading` callback
can simulate the default behavior of rendering the previous view by returning
`undefined`.

# Query Parameters

You can pass an array to the `queryParams` prop to whitelist which query
parameters should be passed in from the router and made available as
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
