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
  };

  static contextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  render() {
    const {
      Component, createElement, componentKey: key, queries, ...routerProps,
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
      let { renderFailure } = route;
      const [error, retry] = failure;

      if (typeof renderFailure === 'object' && renderFailure[key]) {
        renderFailure = renderFailure[key];
      }

      if (renderFailure) {
        element = renderFailure(error, retry);
      } else {
        element = null;
      }
    } else if (fragmentPointers) {
      const data = { key, ...routerProps, ...params, ...fragmentPointers };

      let { renderFetched } = route;
      if (typeof renderFetched === 'object' && renderFetched[key]) {
        renderFetched = renderFetched[key];
      }

      if (renderFetched) {
        element = renderFetched(data, readyState);
      } else {
        element = createElement(Component, data);
      }
    } else {
      let { renderLoading } = route;
      if (typeof renderLoading === 'object' && renderLoading[key]) {
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
}
