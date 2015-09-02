# react-router-relay
[Relay](http://facebook.github.io/relay/) integration for [React Router](http://rackt.github.io/react-router/).

[![npm version](https://badge.fury.io/js/react-router-relay.svg)](http://badge.fury.io/js/react-router-relay)

## Usage

Use `ReactRouterRelay.createElement` on your `<Router>`, then define Relay queries and render callbacks for each of your routes:

```js
import ReactRouterRelay from 'react-router-relay';

/* ... */

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

ReactDOM.render((
  <Router history={history} createElement={ReactRouterRelay.createElement}>
    <Route
      path="/" component={Application}
      queries={ViewerQueries}
    >
      <Route
        path="widgets" component={WidgetList}
        queries={ViewerQueries} queryParams={['color']}
        renderLoading={() => <Loading />}
      />
      <Route
        path="widgets/:widgetId" component={Widget}
        queries={ViewerQueries}
      />
    </Route>
  </Router>
), container);
```

`react-router-relay` will automatically generate a combined Relay route with all queries and parameters from the active React Router routes, then pass down the query results to each of the route components. As the queries are all gathered onto a single route, they'll all be fetched at the same time, and the data for your entire page will load and then render in one go.

## Guide

### Installation

The Relay technical preview requires React 14, which limits compatibility to the `1.0.0-beta` releases of React Router. Currently, `react-router-relay` supports the `1.0.0-beta3` release of React Router:

```shell
$ npm install react@next react-dom@next react-relay react-router@1.0.0-beta3
$ npm install react-router-relay
```

### Routes and Queries

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

Any URL parameters for routes with queries and their ancestors will be used as parameters on the Relay route. You can then use these route parameters as variables on your containers:

```js
class Widget extends React.Component { /* ... */ }

Widget = Relay.createContainer(Widget, {
  initialVariables: {
    widgetId: null
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        widget(widgetId: $widgetId) {
          name
        }
      }
    `
  }
});

// This handles e.g. /widgets/3.
const widgetRoute = (
  <Route
    path="widgets/:widgetId" component={Widget}
    queries={ViewerQueries}
  />
);
```

If your route has query parameters, just specify them on the `queryParams` prop on the `<Route>`, and they'll be added to the Relay route as well:

```js
class WidgetList extends React.Component { /* ... */ }

WidgetList = Relay.createContainer(WidgetList, {
  initialVariables: {
    color: null
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        widgets(color: $color, first: 10) {
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

// This handles e.g. /widgets?color=blue.
const widgetListRoute = (
  <Route
    path="widgets" component={WidgetList}
    queries={ViewerQueries} queryParams={['color']}
  />
);
```

All URL and query parameters will be passed to the container as strings. If you need to convert them into something else, you can do so in `prepareVariables` on the container.

### Render Callbacks

You can pass in custom `renderLoading`, `renderFetched`, and `renderFailure` callbacks to your routes:

```js
<Route /* ... */ renderLoading={() => <Loading />} />
```

These have the same signature and behavior as they do on `Relay.RootContainer`, except that the argument to `renderFetched` also includes the injected props from React Router. As on `Relay.RootContainer`, the `renderLoading` callback can simulate the default behavior of rendering the previous view by returning `undefined`.

### Caveats

- Relay containers attempt to avoid re-rendering except when necessary. However, they can only do so when all props not through Relay are of scalar types. As the props injected by Relay Router into route components are not of static types, this optimization does not work there. As such, when using React Router with Relay, you should attempt to make the `render` method on any route components as lightweight as possible, and leave the real rendering work to child components that only receive scalar non-Relay props.

## Authors

- [@devknoll](https://github.com/devknoll)
- [@cpojer](https://github.com/cpojer)
- [@taion](https://github.com/taion)
