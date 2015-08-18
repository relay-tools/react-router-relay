relay-nested-routes
=========================
Nested react-router views for Relay

    $ npm install --save relay-nested-routes

After you've installed it, add it as a root `<Route>` to your
react-router@>=1.0.0-beta3 routes like so:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';

import RelayNestedRoutes from 'relay-nested-routes';
var NestedRootContainer = RelayNestedRoutes(React, Relay);

/* ... */

ReactDOM.render((
  <Router history={new BrowserHistory()}>
    <Route component={NestedRootContainer}>
      <Route component={App} queries={AppQueries}>
        <Route path="/" component={Dashboard} queries={DashboardQueries}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('react-root'));
```

Define an object containing your queries that a particular `Relay.Container`
needs and add it as a `queries` prop to any container `<Route/>`s.

`relay-nested-routes` will automatically generate a component that includes all
of your fragments, and a route that includes all of your root queries,
and dispatch/render everything in one go.

You can also pass props like `renderLoading` by adding them as props to the
`NestedRootContainer` route.

# Todo

* Named react-router components

# Thanks

[@cpojer](https://github.com/cpojer)

[@taion](https://github.com/taion)
