import getRouteParams from 'react-router/lib/getRouteParams';

export default function mergeRouteParams(prevParams, route, routerProps) {
  const params = {
    ...prevParams,
    ...getRouteParams(route, routerProps.params),
  };

  const { prepareParams } = route;
  if (!prepareParams) {
    return params;
  }

  return prepareParams(params, routerProps.location);
}
