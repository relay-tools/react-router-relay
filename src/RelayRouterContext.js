import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

import QueryAggregator from './QueryAggregator';

const propTypes = {
  location: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};

const childContextTypes = {
  queryAggregator: PropTypes.object.isRequired,
};

class RelayRouterContext extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.queryAggregator = new QueryAggregator(props);
  }

  getChildContext() {
    return {
      queryAggregator: this.queryAggregator,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location === this.props.location) {
      return;
    }

    this.queryAggregator.updateQueryConfig(nextProps);
  }

  renderCallback = (renderArgs) => {
    this.queryAggregator.setRenderArgs(renderArgs);
    return this.props.children;
  };

  render() {
    return (
      <Relay.Renderer
        {...this.props}
        Container={this.queryAggregator}
        render={this.renderCallback}
        queryConfig={this.queryAggregator.queryConfig}
      />
    );
  }
}

RelayRouterContext.propTypes = propTypes;
RelayRouterContext.childContextTypes = childContextTypes;

export default RelayRouterContext;
