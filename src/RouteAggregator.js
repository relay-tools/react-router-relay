import invariant from 'invariant';
import isEqualShallow from 'is-equal-shallow';
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

    this._data = {};
    this._failure = null;
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

        // The component and routeParams args here are no-ops if the query is
        // using the shorthand syntax.
        relayRoute.queries[uniqueQueryName] =
          () => query(component, routeParams);
        fragmentSpecs[uniqueQueryName] = {component, queryName};
      });
    });

    relayRoute.name =
      ['$$_aggregated', ...Object.keys(relayRoute.queries)].join('-');

    // Don't change the route if it's the same as the previous route, to
    // prevent Relay.RootContainer from fetching data twice if the previous
    // request is still pending.
    if (
      this.route &&
      relayRoute.name === this.route.name &&
      isEqualShallow(relayRoute.params, this.route.params)
    ) {
      return;
    }

    // RootContainer uses referential equality to check for route change, so
    // replace the route object entirely.
    this.route = relayRoute;
    this._fragmentSpecs = fragmentSpecs;
  }

  _getUniqueQueryName(route, queryName) {
    // There might be some edge case here where the query changes but the route
    // object does not, in which case we'll keep using the old unique name.
    // Anybody who does that deserves whatever they get, though.
    let routeIndex = this._routeIndices.get(route);
    if (routeIndex === undefined) {
      routeIndex = ++this._lastRouteIndex;
      this._routeIndices.set(route, routeIndex);
    }

    return `$$_route[${routeIndex}]_${queryName}`;
  }

  setLoading() {
    this._failure = null;
  }

  setFetched(data) {
    this._failure = null;
    this._data = data;
  }

  setFailure(error, retry) {
    this._failure = [error, retry];
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

    return {fragmentPointers};
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
