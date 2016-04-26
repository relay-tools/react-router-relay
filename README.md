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
      <Route path="widgets">
        <IndexRoute
          component={WidgetList}
          queries={ViewerQueries}
          prepareParams={prepareWidgetListParams}
        />
        <Route
          path=":widgetId" component={Widget}
          queries={WidgetQueries}
          render={({ props }) => props ? <Widget {...props} /> : <Loading />}
        />
      </Route>
    </Route>
  </Router>
), container);
```

`react-router-relay` will automatically generate a combined Relay query config with all queries and parameters from the active React Router routes, then pass down the query results to each of the route components. As the queries are all gathered onto a single query config, they'll all be fetched in parallel, and the data for your entire page will load and then render in one go.

You can find an example implementation of TodoMVC with routing using `react-router-relay` at https://github.com/taion/relay-todomvc.

## Guide

### Installation

```shell
$ npm install react react-dom react-relay react-router
$ npm install react-router-relay
```

### Routes and queries

#### Basic configuration

For each of your routes that requires data from Relay, define a `queries` prop on the `<Route>`. These should be just like the queries on a Relay query config:

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

Just like with `Relay.Renderer`, the component will receive the query results as props, in addition to the other injected props from React Router.

If your route doesn't have any dependencies on Relay data, just don't declare `queries`. The only requirement is that any route that does define `queries` must have a Relay container as its component.

If your route's Relay data dependencies are a function of the location or of the parameters, you can define a `getQueries` function on your route that returns the computed queries as a function of the current router state:

```js
<Route
  component={Widget}
  getQueries={({ location, params }) => getWidgetQueries(location, params)}
/>
```

#### Path parameters

Any path parameters for routes with queries and their ancestors will be used as parameters on the Relay query config:

```js
const WidgetQueries = {
  widget: () => Relay.QL`
    query {
      widget(widgetId: $widgetId), # $widgetId comes from the path.
    }
  `
}

const Widget = Relay.createContainer(/* ... */, {
  fragments: {
    widget: () => Relay.QL`
      fragment on Widget {
        name,
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

If your queries require additional parameters from the location, such as from the location query or state, you can add those parameters with `prepareParams`. You can also use `prepareParams` to do additional conversion or initialization of your parameters.

The `prepareParams` method has the same signature and behavior as `prepareParams` on a Relay query config, except that it also receives the current location as an argument.

Additionally, you can use route parameters as variables on your containers:

```js
const WidgetList = Relay.createContainer(/* ... */, {
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
              name,
            },
          },
        },
      }
    `
  }
});

function prepareWidgetListParams(params, location) {
  const { color, size } = location.query;
  const limit = location.state && location.state.limit;

  return {
    ...params,
    color,
    size: size && parseInt(size, 10),
    limit: limit || 10,
  };
};

// This handles e.g. /widgets?color=blue&size=3.
const widgetListRoute = (
  <Route
    path="widgets" component={WidgetList}
    queries={ViewerQueries}
    prepareParams={prepareWidgetListParams}
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

### Render callback

You can pass in a custom `render` callback to your routes:

```js
<Route
  component={WidgetList}
  queries={ViewerQueries}
  render={({ props }) => props ? <WidgetList {...props} /> : <Loading />}
/>
```

This has the same signature as the `render` callback on `Relay.Renderer`, except that, when present, `props` will also include the injected props from React Router. As on `Relay.Renderer`, you can return `undefined` to continuing rendering the last view rendered.

While transitioning, the ready state properties will reflect the ready state of the transition as a whole. However, the `props` object in the `render` callback for a route will be populated as long as the data for that particular route are ready. For example, if a transition does not change the params to the queries for a parent route, the `render` callback for that route will have `props`, even while `ready` is still `false`.

When using named components, you can define these on a per-component basis, optionally omitting the callback for components that do not need a custom render callback:

```js
<Route
  components={{ foo: FooComponent, bar: BarComponent }}
  queries={{ foo: FooQueries, bar: BarQueries }}
  render={{ foo: renderFoo }}
/>
```

### Additional `Relay.Renderer` configuration

We pass through additional props on `<Router>` or the generated router context to the underlying `Relay.Renderer`. You can use this to control props like `forceFetch` on the `Relay.Renderer`:

```js
<Router
  history={history} routes={routes}
  render={applyRouterMiddleware(useRelay)}
  forceFetch={true}
/>
```

### Notes

- `react-router-relay` only updates the Relay query config on actual location changes. Specifically, it will not update the Relay query config after changes to location state, so ensure that you update your container variables appropriately when updating location state.
- `react-router-relay` uses referential equality on route objects to generate unique names for queries. If your `route` objects do not maintain referential equality, then you can specify a globally unique `name` property on the route to identify it.
- Relay's re-rendering optimizations only work when all non-Relay props are scalar. As the props injected by React Router are objects, they disable these re-rendering optimizations. To take maximum advantage of these optimizations, you should make the `render` methods on your route components as lightweight as possible, and do as much rendering work as possible in child components that only receive scalar and Relay props.

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
