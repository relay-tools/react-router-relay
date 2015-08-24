import React from 'react';
import Relay from 'react-relay';

export default class ReactRouterRelayContainer extends React.Component {
  static childContextTypes = {
    route: Relay.PropTypes.QueryConfig.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = { content: props.content || null };
  }

  getChildContext() {
    return {route: this.props.route};
  }

  render() {
    return this.state.content;
  }

  setContent(content) {
    this.setState({ content: content || null });
  }
}
