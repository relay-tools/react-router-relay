import React from 'react';
import Relay from 'react-relay';
import RelayRenderer from 'react-relay/lib/RelayRenderer.js';
import RouterContext from 'react-router/lib/RouterContext';
import RouteAggregator from './RouteAggregator';
import RouteContainer from './RouteContainer';
import getRouteQueries from './utils/getRouteQueries';

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

  createElement = (Component, props, relayRenderArgs) => {
    /* eslint-disable react/prop-types */
    const { key, route } = props;
    /* eslint-enable react/prop-types */

    const routeQueries = getRouteQueries(route, props);
    const queries = key ? routeQueries && routeQueries[key] : routeQueries;
    if (!queries) {
      return this.props.createElement(Component, props);
    }

    return (
      <RouteContainer
        {...props}
        relayRenderArgs={relayRenderArgs}
        Component={Component}
        createElement={this.props.createElement}
        componentKey={key}
        queries={queries}
      />
    );
  };

  // relayRenderArgs type:
  // RelayRenderArgs = {
  //   done: boolean;
  //   error: ?Error;
  //   props: ?({ [propName: string]: mixed });
  //   retry: ?(() => void);
  //   stale: boolean;
  // };
  renderRelay = (relayRenderArgs) =>
    this.renderComponent(relayRenderArgs);

  renderComponent(relayRenderArgs) {
    return (
      <RouterContext
        {...this.props}
        createElement={ // eslint-disable-line react/jsx-no-bind
          (Component, props) =>
            this.createElement(Component, props, relayRenderArgs)
        }
      />
    );
  }

  render() {
    return (
      <RelayRenderer
        {...this.props}
        Container={this._routeAggregator}
        environment={Relay.Store}
        render={this.renderRelay}
        queryConfig={this._routeAggregator.route}
      />
    );
  }
}
