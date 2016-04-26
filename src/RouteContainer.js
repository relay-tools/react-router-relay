import React from 'react';
import StaticContainer from 'react-static-container';

import getParamsForRoute from './utils/getParamsForRoute';

const propTypes = {
  queries: React.PropTypes.object.isRequired,
  routerProps: React.PropTypes.object.isRequired,
  children: React.PropTypes.node.isRequired,
};

const contextTypes = {
  queryAggregator: React.PropTypes.object.isRequired,
};

function RouteContainer(
  { queries, routerProps, children, ...extraProps },
  { queryAggregator }
) {
  const { key, route } = routerProps;

  const params = getParamsForRoute(routerProps);
  const renderArgs =
    queryAggregator.getRenderArgs(route, key, queries, params);

  const relayProps = renderArgs.props;
  const props = relayProps && { ...extraProps, ...params, ...relayProps };

  let { render } = route;
  if (render && typeof render === 'object') {
    render = render[key];
  }

  // The below is largely copied from RelayReadyStateRenderer.

  let element;
  if (render) {
    element = render({
      ...renderArgs,
      props: { ...routerProps, ...props },
    });
  } else if (props) {
    // The child already has routerProps, so just inject the additional props.
    element = React.cloneElement(children, props);
  }

  let shouldUpdate;
  if (element === undefined) {
    element = null;
    shouldUpdate = false;
  } else {
    shouldUpdate = true;
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
