export default function getRouteParams(
  routeParams,
  queryParams,
  allowedQueryParams
) {
  const filteredQueryParams = {};
  allowedQueryParams.forEach(paramKey => {
    filteredQueryParams[paramKey] = queryParams[paramKey];
  });
  return {...filteredQueryParams, ...routeParams};
}
