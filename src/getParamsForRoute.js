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

  return Object.assign(
    paramsForRoute,
    getLocationParams(route.queryParams, location.query),
    getLocationParams(route.stateParams, location.state)
  );
}
