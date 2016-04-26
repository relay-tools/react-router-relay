import getRouteParams from 'react-router/lib/getRouteParams';

export default function mergeRouteParams(prevParams, route, routerProps) {
  const params = {
    ...prevParams,
    ...getRouteParams(route, routerProps.params),
  };

  if (!route.prepareParams) {
    return params;
  }

  return route.prepareParams(params, routerProps.location);
}
