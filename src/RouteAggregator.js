import invariant from 'invariant';
import Relay from 'react-relay';

import getParamsForRoute from './getParamsForRoute';

export default class RouteAggregator {
  constructor() {
    this._uniqueQueryNames = new WeakMap();
    this._lastQueryIndex = 0;

    this.route = null;
    this._fragmentSpecs = null;

    this._data = {};
    this._failure = null;
  }

  updateRoute(routerProps) {
    const {branch, params, location} = routerProps;

    const relayRoute = {
      name: null,
      queries: {},
      params: {},
    };
    const fragmentSpecs = {};

    branch.forEach(route => {
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

      const routeParams = getParamsForRoute({route, branch, params, location});
      Object.assign(relayRoute.params, routeParams);

      Object.keys(queries).forEach(queryName => {
        const query = queries[queryName];
        const uniqueQueryName = this._getUniqueQueryName(query, queryName);

        relayRoute.queries[uniqueQueryName] =
          () => query(component, routeParams);
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

  _getUniqueQueryName(query, queryName) {
    let uniqueQueryName = this._uniqueQueryNames.get(query);
    if (uniqueQueryName === undefined) {
      uniqueQueryName = `$$_${queryName}_${++this._lastQueryIndex}`;
      this._uniqueQueryNames.set(query, uniqueQueryName);
    }

    return uniqueQueryName;
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

  getData(queries, params) {
    // Check that the subset of parameters used for this route match those used
    // for the fetched data.
    for (const paramName of Object.keys(params)) {
      if (this._data[paramName] !== params[paramName]) {
        return this._getDataNotFound();
      }
    }

    const fragmentPointers = {};
    for (const queryName of Object.keys(queries)) {
      const query = queries[queryName];
      const uniqueQueryName = this._getUniqueQueryName(query, queryName);

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
    return typeof this._fragmentSpecs[fragmentName] !== 'undefined';
  }
}
