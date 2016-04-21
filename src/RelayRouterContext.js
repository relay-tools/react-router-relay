import React from 'react';
import Relay from 'react-relay';

import RouteAggregator from './RouteAggregator';

export default class RelayRouterContext extends React.Component {
  static propTypes = {
    location: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
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
    if (nextProps.location === this.props.location) {
      return;
    }

    this._routeAggregator.updateRoute(nextProps);
  }

  renderFailure = (error, retry) => {
    this._routeAggregator.setFailure(error, retry);
    return this.props.children;
  };

  renderFetched = (data, readyState) => {
    this._routeAggregator.setFetched(data, readyState);
    return this.props.children;
  };

  renderLoading = () => {
    this._routeAggregator.setLoading();
    return this.props.children;
  };

  render() {
    return (
      <Relay.RootContainer
        {...this.props}
        Component={this._routeAggregator}
        renderFailure={this.renderFailure}
        renderFetched={this.renderFetched}
        renderLoading={this.renderLoading}
        route={this._routeAggregator.route}
      />
    );
  }
}
