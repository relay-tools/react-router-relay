export default function defaultGetParams(routeParams, queryParams) {
  return {...routeParams, ...queryParams};
}
