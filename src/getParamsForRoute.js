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

export default function getParamsForRoute({route, routes, params, location}) {
  const paramsForRoute = {};

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

  var prepareParams = route.prepareParams;
  if (prepareParams) {
    if (typeof prepareParams !== 'function') {
      throw new Error(
        'react-router-relay: Expected `prepareParams` to be a function.'
      );
    }
    paramsForRoute = prepareParams(paramsForRoute, route);
    if (typeof paramsForRoute !== 'object' || paramsForRoute === null) {
      throw new Error(
        'react-router-relay: Expected `prepareParams` to return an object.'
      );
    }
  }

  return paramsForRoute;
}
