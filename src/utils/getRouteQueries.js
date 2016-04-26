export default function getRouteQueries(route, routerProps) {
  if (route.queries) {
    return route.queries;
  }

  if (route.getQueries) {
    // Depending on how we get here, routerProps won't always be the same, but
    // it will always have location, params, and routes, which are all that
    // could possibly be relevant here. Anybody using anything else from
    // routerProps deserves whatever they get.
    return route.getQueries(routerProps);
  }

  return null;
}
