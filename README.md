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

`react-router-relay` will automatically generate a component that includes all of your fragments, and a route that includes all of your root queries,
and dispatch/render everything in one go.

# Queries

`react-router`’s `Route` already has a name and params: this means that all we need to constuct a full `Relay.Route` is `queries` property, which we pass on to `Route` as a prop:

```js
var AppQueries = {
  viewer: (Component) => Relay.QL`
    viewer {
      ${Component.getFragment('viewer')}
    }
  `
};
```

```js
<Route path="/" component={App} queries={AppQueries} />
```

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
/>
```

If you’re passing on params from path components, like a URL containing slugs, make sure to prefix your params with a colon:

```js
<Route
  path='/:username/widgets'
  component={Widgets}
  queries={WidgetsQueries}
  queryParams={[':username', 'date', 'color']} // :username, date and color will be passed as variables
/>
```

## Passing parameters down to fragments

It’s often the case that you’ll want your Component’s query fragments to have access to `react-router`’s params, especially if you’re using a query construction using `viewer`.

```js
<Route
  path='/widgets'
  component={WidgetsList}
  queries={ViewerQueries}
  queryparams={['color']}
/>
```

Route will now pass the `color` variable down to `ViewerQueries`:

```js
const ViewerQueries = {
  viewer: (Component, {color}) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('widgets', {color})}
      }
    }
  `
}
```

And ViewerQueries will use the second argument of `getFragment` to pass down `color` to our query fragment for `WidgetsList`:

```js
Relay.createContainer(WidgetsList, {
  initialVariables: {
    color: null
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        widgets(color: $color)
      }
    `
  }
})
```

# Special Thanks

[@cpojer](https://github.com/cpojer)

[@taion](https://github.com/taion)
