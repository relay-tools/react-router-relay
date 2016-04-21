import React from 'react';
import StaticContainer from 'react-static-container';

import RouteAggregator from './RouteAggregator';
import getParamsForRoute from './utils/getParamsForRoute';

const propTypes = {
  queries: React.PropTypes.object.isRequired,
  routerProps: React.PropTypes.object.isRequired,
  children: React.PropTypes.node.isRequired,
};

const contextTypes = {
  routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
};

function RouteContainer(
  { queries, routerProps, children, ...props },
  { routeAggregator }
) {
  const { key, route } = routerProps;

  const params = getParamsForRoute(routerProps);
  const { failure, fragmentPointers, readyState } =
    routeAggregator.getData(route, key, queries, params);

  let shouldUpdate = true;
  let element;

  // This is largely copied from RelayRootContainer#render.
  if (failure) {
    let { renderFailure } = route;
    if (renderFailure && typeof renderFailure === 'object') {
      renderFailure = renderFailure[key];
    }

    if (renderFailure) {
      const [error, retry] = failure;
      element = renderFailure(error, retry);
    } else {
      element = null;
    }
  } else if (fragmentPointers) {
    const data = { ...props, ...params, ...fragmentPointers };

    let { renderFetched } = route;
    if (renderFetched && typeof renderFetched === 'object') {
      renderFetched = renderFetched[key];
    }

    if (renderFetched) {
      element = renderFetched({ ...routerProps, data }, readyState);
    } else {
      element = React.cloneElement(children, data);
    }
  } else {
    let { renderLoading } = route;
    if (renderLoading && typeof renderLoading === 'object') {
      renderLoading = renderLoading[key];
    }

    if (renderLoading) {
      element = renderLoading();
    } else {
      element = undefined;
    }

    if (element === undefined) {
      element = null;
      shouldUpdate = false;
    }
  }

  return (
    <StaticContainer shouldUpdate={shouldUpdate}>
      {element}
    </StaticContainer>
  );
}

RouteContainer.propTypes = propTypes;
RouteContainer.contextTypes = contextTypes;

export default RouteContainer;
