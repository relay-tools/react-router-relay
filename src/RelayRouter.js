import React from 'react';
import Router from 'rrtr/lib/Router';

import RelayRouterContext from './RelayRouterContext';

export default class RelayRouter extends React.Component {
  static displayName = 'RelayRouter';

  renderRouterContext(props) {
    return <RelayRouterContext {...props} />;
  }

  render() {
    return (
      <Router
        {...this.props}
        render={this.renderRouterContext}
      />
    );
  }
}
