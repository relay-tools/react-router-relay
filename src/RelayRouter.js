import React from 'react';
import {Router} from 'react-router';

import RelayRoutingContext from './RelayRoutingContext';

export default class RelayRouter extends React.Component {
  static displayName = 'RelayRouter';

  render() {
    return (
      <Router
        RoutingContext={RelayRoutingContext}
        {...this.props}
      />
    );
  }
}
