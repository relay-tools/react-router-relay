import React from 'react';
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
    relayRenderArgs: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  render() {
    const {
      Component, createElement, componentKey: key, queries, ...routerProps,
      relayRenderArgs: { done, error, props, retry, stale },
    } = this.props;
    // const relayRenderArgs = { done, error, props, retry, stale };

    const { route } = routerProps;
    const { routeAggregator } = this.context;

    const params = getParamsForRoute(routerProps);
    const { fragmentPointers } =
      routeAggregator.getData(route, key, queries, params, props || {});

    let shouldUpdate = true;

    let { render } = route;
    if (render && typeof render === 'object') {
      render = render[key];
    }

    const data = { key, ...routerProps, ...params, ...fragmentPointers };
    const localProps = props && data;

    let children;
    if (render) {
      children = render({ done, error, props: localProps, data, retry, stale });
    } else if (localProps) {
      children = <Component {...localProps} />;
    }

    if (children === undefined) {
      children = null;
      shouldUpdate = false;
    }

    return (
      <StaticContainer shouldUpdate={shouldUpdate}>
        {children}
      </StaticContainer>
    );
  }
}
