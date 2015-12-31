import React from 'react';
import Relay from 'react-relay';
import { RouterContext } from 'react-router';

import RouteAggregator from './RouteAggregator';
import RouteContainer from './RouteContainer';

export default class RelayRouterContext extends React.Component {
  static displayName = 'RelayRouterContext';

  static propTypes = {
    createElement: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static childContextTypes = {
    routeAggregator: React.PropTypes.instanceOf(RouteAggregator).isRequired,
  };

  static defaultProps = {
    createElement: React.createElement,
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

  createElement = (Component, props) => {
    return (
      <RouteContainer
        {...props}
        Component={Component}
        createElement={this.props.createElement}
      />
    );
  };

  renderFailure = (error, retry) => {
    this._routeAggregator.setFailure(error, retry);
    return this.renderComponent();
  };

  renderFetched = (data, readyState) => {
    this._routeAggregator.setFetched(data, readyState);
    return this.renderComponent();
  };

  renderLoading = () => {
    this._routeAggregator.setLoading();
    return this.renderComponent();
  };

  renderComponent() {
    return (
      <RouterContext
        {...this.props}
        createElement={this.createElement}
      />
    );
  }

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
