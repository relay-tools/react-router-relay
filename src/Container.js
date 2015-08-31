import React from 'react';
import StaticContainer from 'react-static-container';

import getParamsForRoute from './getParamsForRoute';
import RootComponent from './RootComponent';
import RouteAggregator from './RouteAggregator';

export default class Container extends React.Component {
  static displayName = 'ReactRouterRelay.Container';

  static propTypes = {
    Component: React.PropTypes.func.isRequired,
  };

  static contextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator),
  };

  render() {
    const {routeAggregator} = this.context;
    if (!routeAggregator) {
      return <RootComponent {...this.props} />;
    }

    const {Component, ...routerProps} = this.props;
    const {route} = routerProps;

    const {queries} = route;
    if (!queries) {
      return <Component {...routerProps} />;
    }

    const params = getParamsForRoute(routerProps);
    const {fragmentPointers, failure} =
      routeAggregator.getData(route, queries, params);

    let shouldUpdate = true;
    let element;

    // This is largely copied from RelayRootContainer#render.
    if (failure) {
      const {renderFailure} = route;
      if (renderFailure) {
        const [error, retry] = failure;
        element = renderFailure(error, retry);
      } else {
        element = null;
      }
    } else if (fragmentPointers) {
      const data = {...routerProps, ...params, ...fragmentPointers};

      const {renderFetched} = route;
      if (renderFetched) {
        element = renderFetched(data);
      } else {
        element = <Component {...data} />;
      }
    } else {
      const {renderLoading} = route;
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
