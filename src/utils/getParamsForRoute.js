import invariant from 'invariant';

import getRouteParams from 'react-router/lib/getRouteParams';

function getLocationParams(paramNames, paramSource) {
  if (!paramNames) {
    return null;
  }

  const paramsForRoute = {};
  paramNames.forEach(name => {
    const param = paramSource ? paramSource[name] : null;
    paramsForRoute[name] = param !== undefined ? param : null;
  });

  return paramsForRoute;
}

export default function getParamsForRoute(
  { route, routes, params, location }
) {
  let paramsForRoute = {};

  // Extract route params for current route and all ancestors.
  for (const ancestorRoute of routes) {
    Object.assign(paramsForRoute, getRouteParams(ancestorRoute, params));
    if (ancestorRoute === route) {
      break;
    }
  }

  Object.assign(
    paramsForRoute,
    getLocationParams(route.queryParams, location.query),
    getLocationParams(route.stateParams, location.state)
  );

  const { prepareParams } = route;
  if (prepareParams) {
    invariant(
      typeof prepareParams === 'function',
      'react-router-relay: Expected `prepareParams` to be a function.'
    );
    paramsForRoute = prepareParams(paramsForRoute, route);
    invariant(
      typeof paramsForRoute === 'object' && paramsForRoute !== null,
      'react-router-relay: Expected `prepareParams` to return an object.'
    );
  }

  return paramsForRoute;
}
