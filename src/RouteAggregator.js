import invariant from 'invariant';
import Relay from 'react-relay';

import getParamsForRoute from './getParamsForRoute';

export default class RouteAggregator {
  constructor() {
    // We need to use a map to track route indices instead of throwing them on
    // the route itself with a Symbol to ensure that, when rendering on the
    // server, each request generates route indices independently.
    this._routeIndices = new WeakMap();
    this._lastRouteIndex = 0;

    this.route = null;
    this._fragmentSpecs = null;

    this._failure = null;
    this._data = {};
    this._readyState = null;
  }

  updateRoute({routes, params, location}) {
    const relayRoute = {
      name: null,
      queries: {},
      params: {},
    };
    const fragmentSpecs = {};

    routes.forEach(route => {
      const {queries} = route;
      if (!queries) {
        return;
      }

      const {component} = route;

      // In principle not all container component routes have to specify
      // queries, because some of them might somehow receive fragments from
      // their parents, but it would definitely be wrong to specify queries
      // for a component that isn't a container.
      invariant(
        Relay.isContainer(component),
        'relay-nested-routes: Route with queries specifies component `%s` ' +
        'that is not a Relay container.',
        component.displayName || component.name
      );

      const routeParams = getParamsForRoute({route, routes, params, location});
      Object.assign(relayRoute.params, routeParams);

      Object.keys(queries).forEach(queryName => {
        const query = queries[queryName];
        const uniqueQueryName = this._getUniqueQueryName(route, queryName);

        // Relay depends on the argument count of the query function, so try to
        // preserve it as well as possible.
        let wrappedQuery;
        if (query.length === 0) {
          // Relay doesn't like using the exact same query in multiple places,
          // so wrap it to prevent that when sharing queries between routes.
          wrappedQuery = () => query();
        } else {
          // We just need the query function to have > 0 arguments.
          /* eslint-disable no-unused-vars */
          wrappedQuery = _ => query(component, routeParams);
          /* eslint-enable */
        }

        relayRoute.queries[uniqueQueryName] = wrappedQuery;
        fragmentSpecs[uniqueQueryName] = {component, queryName};
      });
    });

    relayRoute.name =
      ['$$_aggregated', ...Object.keys(relayRoute.queries)].join('-');

    // RootContainer uses referential equality to check for route change, so
    // replace the route object entirely.
    this.route = relayRoute;
    this._fragmentSpecs = fragmentSpecs;
  }

  _getUniqueQueryName(route, queryName) {
    // There might be some edge case here where the query changes but the route
    // object does not, in which case we'll keep using the old unique name.
    // Anybody who does that deserves whatever they get, though.

    // Prefer an explicit route name if specified.
    if (route.name) {
      // The slightly different template here ensures that we can't have
      // collisions with the below template.
      return `$_${route.name}_${queryName}`;
    }

    // Otherwise, use referential equality on the route name to generate a
    // unique index.
    let routeIndex = this._routeIndices.get(route);
    if (routeIndex === undefined) {
      routeIndex = ++this._lastRouteIndex;
      this._routeIndices.set(route, routeIndex);
    }

    return `$$_route[${routeIndex}]_${queryName}`;
  }

  setFailure(error, retry) {
    this._failure = [error, retry];
  }

  setFetched(data, readyState) {
    this._failure = null;
    this._data = data;
    this._readyState = readyState;
  }

  setLoading() {
    this._failure = null;
  }

  getData(route, queries, params) {
    // Check that the subset of parameters used for this route match those used
    // for the fetched data.
    for (const paramName of Object.keys(params)) {
      if (this._data[paramName] !== params[paramName]) {
        return this._getDataNotFound();
      }
    }

    const fragmentPointers = {};
    for (const queryName of Object.keys(queries)) {
      const uniqueQueryName = this._getUniqueQueryName(route, queryName);

      const fragmentPointer = this._data[uniqueQueryName];
      if (!fragmentPointer) {
        return this._getDataNotFound();
      }

      fragmentPointers[queryName] = fragmentPointer;
    }

    return {
      fragmentPointers,
      readyState: this._readyState,
    };
  }

  _getDataNotFound() {
    return {failure: this._failure};
  }

  getFragmentNames() {
    return Object.keys(this._fragmentSpecs);
  }

  getFragment(fragmentName, variableMapping) {
    const {component, queryName} = this._fragmentSpecs[fragmentName];
    return component.getFragment(queryName, variableMapping);
  }

  hasFragment(fragmentName) {
    return this._fragmentSpecs[fragmentName] !== undefined;
  }

  hasVariable(variableName) {
    // It doesn't matter what the component variables are. The only variables
    // we're going to pass down are the ones defined from our route parameters.
    return this.route.params.hasOwnProperty(variableName);
  }
}
