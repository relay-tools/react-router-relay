import React from 'react';
import Relay from 'react-relay';

import Container from './Container';
import RouteAggregator from './RouteAggregator';

export default class RootComponent extends React.Component {
  static displayName = 'ReactRouterRelay.RootComponent';

  static propTypes = {
    routes: React.PropTypes.array.isRequired,
  };

  static childContextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this._routeAggregator = new RouteAggregator();
    this._routeAggregator.updateRoute(props);
  }

  getChildContext() {
    return {
      routeAggregator: this._routeAggregator,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routes === this.props.routes) {
      return;
    }

    this._routeAggregator.updateRoute(nextProps);
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
