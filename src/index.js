import React from 'react';

import RelayRouterContext from './RelayRouterContext';
import RouteContainer from './RouteContainer';
import getRouteQueries from './utils/getRouteQueries';

export default {
  renderRouterContext: (child, props) => (
    <RelayRouterContext {...props}>
      {child}
    </RelayRouterContext>
  ),

  renderRouteComponent: (child, props) => {
    /* eslint-disable react/prop-types */
    const { key, route } = props;
    /* eslint-enable react/prop-types */

    const routeQueries = getRouteQueries(route, props);
    const queries = key ? routeQueries && routeQueries[key] : routeQueries;
    if (!queries) {
      return child;
    }

    return (
      <RouteContainer queries={queries} routerProps={props}>
        {child}
      </RouteContainer>
    );
  },
};
