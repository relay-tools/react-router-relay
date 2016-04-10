import React from 'react';
import StaticContainer from 'react-static-container';

import getParamsForRoute from './getParamsForRoute';
import RouteAggregator from './RouteAggregator';

export default class RouteContainer extends React.Component {
  static displayName = 'RouteContainer';

  static propTypes = {
    Component: React.PropTypes.func.isRequired,
    createElement: React.PropTypes.func.isRequired,
    componentKey: React.PropTypes.string,
    queries: React.PropTypes.object.isRequired,
    props: React.PropTypes.object,
  };

  static contextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  render() {
    const {
      Component, createElement, componentKey: key, queries, props, ...routerProps,
    } = this.props;
    const { route } = routerProps;
    const { routeAggregator } = this.context;

    const params = getParamsForRoute(routerProps);
    const { failure, fragmentPointers, readyState } =
      routeAggregator.getData(route, key, queries, params);

    let shouldUpdate = true;
    let element;

    // This is largely copied from RelayRootContainer#render.
    if (failure) {
      const { renderFailure } = route;
      if (renderFailure) {
        const [error, retry] = failure;
        element = renderFailure(error, retry);
      } else {
        element = null;
      }
    } else if (fragmentPointers) {
      const data = { key, ...props, ...routerProps, ...params, ...fragmentPointers };

      const { renderFetched } = route;
      if (renderFetched) {
        element = renderFetched(data, readyState);
      } else {
        element = createElement(Component, data);
      }
    } else {
      const { renderLoading } = route;
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
}
