export default function getRouteParams(
  routeParams,
  queryParams,
  allowedQueryParams
) {
  const filteredQueryParams = {...queryParams};
  const allowedQueryParamSet = new Set(allowedQueryParams);
  Object.keys(filteredQueryParams).forEach(paramName => {
    if (!allowedQueryParamSet.has(paramName)) {
      delete filteredQueryParams[paramName];
    }
  });
  return {...filteredQueryParams, ...routeParams};
}
