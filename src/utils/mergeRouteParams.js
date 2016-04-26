import getRouteParams from 'react-router/lib/getRouteParams';

export default function mergeRouteParams(prevParams, route, routerProps) {
  const params = {
    ...prevParams,
    ...getRouteParams(route, routerProps.params),
  };

  if (!route.prepareParams) {
    return params;
  }

  // Depending on how we get here, routerProps won't always be the same, but it
  // will always have location, params, and routes, which are all that could
  // possibly be relevant here. Anybody using anything else from routerProps
  // deserves whatever they get.
  return route.prepareParams(params, routerProps);
}
