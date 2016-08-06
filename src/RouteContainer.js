import React from 'react';
import StaticContainer from 'react-static-container';

import mergeRouteParams from './utils/mergeRouteParams';

const propTypes = {
  queries: React.PropTypes.object.isRequired,
  routerProps: React.PropTypes.object.isRequired,
  children: React.PropTypes.element.isRequired,
};

const contextTypes = {
  queryAggregator: React.PropTypes.object.isRequired,
};

function RouteContainer(
  { queries, routerProps, children, ...extraProps },
  { queryAggregator }
) {
  const { key, route, routes } = routerProps;

  let params = {};
  for (const ancestorRoute of routes) {
    params = mergeRouteParams(params, ancestorRoute, routerProps);

    if (ancestorRoute === route) {
      break;
    }
  }

  const renderArgs =
    queryAggregator.getRenderArgs(route, key, queries, params);

  const { props } = renderArgs;

  let { render } = route;
  if (render && typeof render === 'object') {
    render = render[key];
  }

  // The below is largely copied from RelayReadyStateRenderer.

  let element;
  if (render) {
    element = render.call(route, {
      ...renderArgs,
      props: props && {
        ...routerProps,
        ...extraProps,
        ...params,
        ...props,
      },
      routerProps: {
        ...routerProps,
        ...extraProps,
      },
      element: children,
    });
  } else if (props) {
    // The child already has routerProps, so just inject the additional props.
    element = React.cloneElement(children, {
      ...extraProps,
      ...params,
      ...props,
    });
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
