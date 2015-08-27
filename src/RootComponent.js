import React from 'react';
import Relay from 'react-relay';

import Container from './Container';
import RouteAggregator from './RouteAggregator';

export default class RootComponent extends React.Component {
  static displayName = 'ReactRouterRelay.RootComponent';

  static propTypes = {
    routerProps: React.PropTypes.object.isRequired,
  };

  static childContextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this._routeAggregator = new RouteAggregator();
    this._routeAggregator.updateRoute(props.routerProps);
  }

  getChildContext() {
    return {
      routeAggregator: this._routeAggregator,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {routerProps} = nextProps;
    if (routerProps.isTransitioning) {
      return;
    }

    this._routeAggregator.updateRoute(routerProps);
  }

  renderLoading = () => {
    this._routeAggregator.setLoading();
    return this.renderComponent();
  };

  renderFetched = (data) => {
    this._routeAggregator.setFetched(data);
    return this.renderComponent();
  };

  renderFailure = (error, retry) => {
    this._routeAggregator.setFailure(error, retry);
    return this.renderComponent();
  };

  renderComponent() {
    return <Container {...this.props} />;
  }

  render() {
    return (
      <Relay.RootContainer
        Component={this._routeAggregator}
        route={this._routeAggregator.route}
        renderLoading={this.renderLoading}
        renderFetched={this.renderFetched}
        renderFailure={this.renderFailure}
      />
    );
  }
}
