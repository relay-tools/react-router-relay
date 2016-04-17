import React from 'react';
import Relay from 'react-relay';
import StaticContainer from 'react-static-container';

import RouteAggregator from './RouteAggregator';
import getParamsForRoute from './utils/getParamsForRoute';

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
      const data = { key, ...routerProps, ...params, ...fragmentPointers };

      if (Relay.isContainer(Component)) {
        for (const fragmentName of Component.getFragmentNames()) {
          if (!(fragmentName in data)) data[fragmentName] = null;
        }
      }

      let { renderFetched } = route;
      if (renderFetched && typeof renderFetched === 'object') {
        renderFetched = renderFetched[key];
      }

      if (renderFetched) {
        element = renderFetched(data, readyState);
      } else {
        element = createElement(Component, data);
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
}
