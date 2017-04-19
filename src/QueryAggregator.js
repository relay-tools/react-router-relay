import invariant from 'invariant';
import isEqual from 'lodash/isEqual';
import Relay from 'react-relay/classic';

import getRouteQueries from './utils/getRouteQueries';
import mergeRouteParams from './utils/mergeRouteParams';

const DEFAULT_KEY = '_default';

export default class QueryAggregator {
  constructor(routerProps) {
    // We need to use a map to track route indices instead of throwing them on
    // the route itself with a Symbol to ensure that, when rendering on the
    // server, each request generates route indices independently.
    this.routeIndices = new WeakMap();
    this.lastRouteIndex = 0;

    this.queryConfig = null;
    this.fragmentSpecs = null;

    this.props = {};
    this.readyState = null;

    this.updateQueryConfig(routerProps);
  }

  updateQueryConfig(routerProps) {
    const { routes, components } = routerProps;

    const queryConfig = {
      name: null,
      queries: {},
      params: {},
    };
    const fragmentSpecs = {};

    routes.forEach((route, i) => {
      // We need to merge in the route params regardless of whether the route
      // actually has queries, in case its children depend on its path params.
      queryConfig.params = mergeRouteParams(
        queryConfig.params, route, routerProps,
      );

      const routeQueries = getRouteQueries(route, routerProps);
      if (!routeQueries) {
        return;
      }

      const routeComponent = components[i];

      let componentMap;
      let queryMap;
      if (typeof routeComponent === 'object') {
        componentMap = routeComponent;
        queryMap = routeQueries;
      } else {
        componentMap = { [DEFAULT_KEY]: routeComponent };
        queryMap = { [DEFAULT_KEY]: routeQueries };
      }

      Object.keys(componentMap).forEach((key) => {
        const component = componentMap[key];
        const queries = queryMap[key];

        if (!queries) {
          return;
        }

        // In principle not all container component routes have to specify
        // queries, because some of them might somehow receive fragments from
        // their parents, but it would definitely be wrong to specify queries
        // for a component that isn't a container.
        invariant(
          Relay.isContainer(component),
          'relay-router-relay: Route with queries specifies component `%s` ' +
          'that is not a Relay container.',
          component && (component.displayName || component.name),
        );

        Object.keys(queries).forEach((queryName) => {
          const query = queries[queryName];
          const uniqueQueryName =
            this.getUniqueQueryName(route, key, queryName);

          // Relay depends on the argument count of the query function, so try
          // to preserve it as well as possible.
          let wrappedQuery;
          if (query.length === 0) {
            // Relay doesn't like using the exact same query in multiple
            // places, so wrap it to prevent that when sharing queries between
            // routes.
            wrappedQuery = () => query();
          } else {
            // When not using the shorthand, we can control the injected
            // params, so restrict them to just the ones for the current route
            // and its ancestors.
            const paramsForRoute = queryConfig.params;

            // We need the query function to have > 0 arguments to hit the code
            // path for non-shorthand queries.
            /* eslint-disable no-unused-vars */
            wrappedQuery = _ => query(component, paramsForRoute);
            /* eslint-enable */
          }

          queryConfig.queries[uniqueQueryName] = wrappedQuery;
          fragmentSpecs[uniqueQueryName] = { component, queryName };
        });
      });
    });

    queryConfig.name =
      ['_aggregated', ...Object.keys(queryConfig.queries)].join('_');

    // RootContainer uses referential equality to check for route change, so
    // replace the route object entirely.
    this.queryConfig = queryConfig;
    this.fragmentSpecs = fragmentSpecs;
  }

  getUniqueQueryName(route, key, queryName) {
    // There might be some edge case here where the query changes but the route
    // object does not, in which case we'll keep using the old unique name.
    // Anybody who does that deserves whatever they get, though.

    // Prefer an explicit route name if specified.
    if (route.name) {
      // The slightly different template here ensures that we can't have
      // collisions with the below template.
      return `_${route.name}_${key}_${queryName}`;
    }

    // Otherwise, use referential equality on the route name to generate a
    // unique index.
    let routeIndex = this.routeIndices.get(route);
    if (routeIndex === undefined) {
      routeIndex = ++this.lastRouteIndex;
      this.routeIndices.set(route, routeIndex);
    }

    return `__route_${routeIndex}_${key}_${queryName}`;
  }

  setRenderArgs({ props, ...readyState }) {
    if (props) {
      this.props = props;
    }

    this.readyState = readyState;
  }

  getRenderArgs(route, key, queries, params) {
    return {
      ...this.readyState,
      props: this.getProps(route, key, queries, params),
    };
  }

  getProps(route, key = DEFAULT_KEY, queries, params) {
    // Check that the subset of parameters used for this route match those used
    // for the fetched data.
    for (const paramName of Object.keys(params)) {
      if (!isEqual(this.props[paramName], params[paramName])) {
        return null;
      }
    }

    const props = {};
    for (const queryName of Object.keys(queries)) {
      const uniqueQueryName = this.getUniqueQueryName(route, key, queryName);

      const value = this.props[uniqueQueryName];
      if (!value) {
        return null;
      }

      props[queryName] = value;
    }

    // Only return the props for the route if the query config params match and
    // all requested props are available. Otherwise, by assumption, the ready
    // state will have the correct "not ready" state.
    return props;
  }

  // The below methods are required to satisfy the Relay container contract.

  getFragmentNames() {
    return Object.keys(this.fragmentSpecs);
  }

  getFragment(fragmentName, variableMapping) {
    const { component, queryName } = this.fragmentSpecs[fragmentName];
    return component.getFragment(queryName, variableMapping);
  }

  hasFragment(fragmentName) {
    return this.fragmentSpecs[fragmentName] !== undefined;
  }

  hasVariable(variableName) {
    // It doesn't matter what the component variables are. The only variables
    // we're going to pass down are the ones defined from our route parameters.
    return Object.prototype.hasOwnProperty.call(
      this.queryConfig.params, variableName,
    );
  }
}
