# react-router-relay [![Travis][build-badge]][build] [![npm][npm-badge]][npm]
[Relay](http://facebook.github.io/relay/) integration for [React Router](https://github.com/reactjs/react-router).

[![Discord][discord-badge]][discord]

## Usage

Apply the `useRelay` router middleware, then define Relay queries and render callbacks for each of your routes:

```js
import useRelay from 'react-router-relay';

/* ... */

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

const WidgetQueries = {
  widget: () => Relay.QL`query { widget(widgetId: $widgetId) }`
}

ReactDOM.render((
  <Router
    history={history}
    render={applyRouterMiddleware(useRelay)}
  >
    <Route
      path="/" component={Application}
      queries={ViewerQueries}
    >
      <Route
        path="widgets" component={WidgetList}
        queries={ViewerQueries}
        queryParams={['color']} stateParams={['limit']}
        prepareParams={prepareWidgetListParams}
        renderLoading={() => <Loading />}
      />
      <Route
        path="widgets/:widgetId" component={Widget}
        queries={WidgetQueries}
      />
    </Route>
  </Router>
), container);
```

`react-router-relay` will automatically generate a combined Relay route with all queries and parameters from the active React Router routes, then pass down the query results to each of the route components. As the queries are all gathered onto a single route, they'll all be fetched at the same time, and the data for your entire page will load and then render in one go.

You can find an example implementation of TodoMVC with routing using `react-router-relay` at https://github.com/taion/relay-todomvc.

## Guide

### Installation

```shell
$ npm install react react-dom react-relay react-router
$ npm install react-router-relay
```

### Routes and queries

#### Basic configuration

For each of your routes that requires data from Relay, define a `queries` prop on the `<Route>`. These should be just like the queries on a Relay route:

```js
const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

const applicationRoute = (
  <Route
    path="/" component={Application}
    queries={ViewerQueries}
  />
);
```

Just like with `Relay.RootContainer`, the component will receive the query results as props, in addition to the other injected props from React Router.

If your route doesn't have any dependencies on Relay data, just don't declare `queries`. The only requirement is that any route that does define `queries` must have a Relay container as its component.

If your route's Relay data dependencies are a function of the location or of the parameters, you can define a `getQueries` function on your route that returns the computed queries as a function of the current router state:

```js
<Route
  component={Widget}
  getQueries={({ location, params }) => getWidgetQueries(location, params)}
/>
```

#### Path parameters

Any path parameters for routes with queries and their ancestors will be used as parameters on the Relay route:

```js
const WidgetQueries = {
  widget: () => Relay.QL`
    query {
      widget(widgetId: $widgetId) # `widgetId` receives a value from the route
    }
  `
}

class Widget extends React.Component { /* ... */ }

Widget = Relay.createContainer(Widget, {
  fragments: {
    widget: () => Relay.QL`
      fragment on Widget {
        name
      }
    `
  }
});

// This handles e.g. /widgets/3.
const widgetRoute = (
  <Route
    path="widgets/:widgetId" component={Widget}
    queries={WidgetQueries}
  />
);
```

#### Additional parameters

If your route requires parameters from the location query or state, you can specify them respectively on the `queryParams` or `stateParams` props on the `<Route>`. URL and query parameters will be strings, while missing query and state parameters will be `null`.

If you need to convert or initialize these parameters, you can do so with `prepareParams`, which has the same signature and behavior as `prepareVariables` on a Relay container, except that it also receives the React Router route object as an argument.

Additionally, you can use route parameters as variables on your containers:

```js
class WidgetList extends React.Component { /* ... */ }

WidgetList = Relay.createContainer(WidgetList, {
  initialVariables: {
    color: null,
    size: null,
    limit: null
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        widgets(color: $color, size: $size, first: $limit) {
          edges {
            node {
              name
            }
          }
        }
      }
    `
  }
});

function prepareWidgetListParams(params, route) {
  return {
    ...params,
    size: params.size ? parseInt(params.size, 10) : null,
    limit: params.limit || route.defaultLimit
  };
};

// This handles e.g. /widgets?color=blue&size=3.
const widgetListRoute = (
  <Route
    path="widgets" component={WidgetList}
    queries={ViewerQueries}
    queryParams={['color', 'size']} stateParams={['limit']}
    prepareParams={prepareWidgetListParams}
    defaultLimit={10}
  />
);
```

#### Named components

For routes with named components, define `queries` as an object with the queries for each component by name:

```js
<Route
  components={{ foo: FooComponent, bar: BarComponent }}
  queries={{ foo: FooQueries, bar: BarQueries }}
/>
```

### Render callbacks

You can pass in custom `renderLoading`, `renderFetched`, and `renderFailure` callbacks to your routes:

```js
<Route /* ... */ renderLoading={() => <Loading />} />
```

These have the same signature and behavior as they do on `Relay.RootContainer`, except that the argument to `renderFetched` also includes the injected props from React Router. As on `Relay.RootContainer`, the `renderLoading` callback can simulate the default behavior of rendering the previous view by returning `undefined`.

When using named components, you can define these on a per-component basis, optionally omitting the callback for components that do not need a custom render callback:

```js
<Route
  components={{ foo: FooComponent, bar: BarComponent }}
  queries={{ foo: FooQueries, bar: BarQueries }}
  renderLoading={{ foo: renderFooLoading }}
  renderFetched={renderFetched}
/>
```

### Additional `Relay.RootContainer` configuration

We pass through additional props on `<Router>` or the generated router context to the underlying `Relay.RootContainer`. You can use this to control props like `forceFetch` on the `Relay.RootContainer`:

```js
<Router
  history={history} routes={routes}
  render={applyRouterMiddleware(useRelay)}
  forceFetch={true}
/>
```

### Notes

- `react-router-relay` only updates the Relay route on actual location changes. Specifically, it will not update the Relay route after changes to location state, so ensure that you update your container variables appropriately when updating location state.
- `react-router-relay` uses referential equality on route objects to generate unique names for queries. If your `route` objects do not maintain referential equality, then you can specify a globally unique `name` property on the route to identify it.
- Relay's re-rendering optimizations only work when all non-Relay props are scalar. As the props injected by React Router are objects, they disable these re-rendering optimizations. To take maximum advantage of these optimizations, you should make the `render` methods on your route components as lightweight as possible, and do as much rendering work as possible in child components that only receive scalar and Relay props.
- Relay implicitly may split query into several http requests, for batching it in single request you should inject [custom RelayNetworkLayer](https://github.com/nodkz/react-relay-network-layer) on the client-side code.

## Authors

- [@devknoll](https://github.com/devknoll)
- [@cpojer](https://github.com/cpojer)
- [@taion](https://github.com/taion)

[build-badge]: https://img.shields.io/travis/relay-tools/react-router-relay/master.svg
[build]: https://travis-ci.org/relay-tools/react-router-relay

[npm-badge]: https://img.shields.io/npm/v/react-router-relay.svg
[npm]: https://www.npmjs.com/package/react-router-relay

[discord-badge]: https://img.shields.io/badge/Discord-join%20chat%20%E2%86%92-738bd7.svg
[discord]: https://discord.gg/0ZcbPKXt5bX40xsQ
