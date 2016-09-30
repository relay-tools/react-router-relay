import React from 'react';

import RelayRouterContext from './RelayRouterContext';
import RouteContainer from './RouteContainer';
import getRouteQueries from './utils/getRouteQueries';

export default {
  renderRouterContext: (child, props) => {
    /* eslint-disable react/prop-types */
    const environment = typeof props.environment === 'function' ?
      props.environment() : props.environment;
    /* eslint-enable react/prop-types */

    return (
      <RelayRouterContext {...Object.assign({}, props, { environment })}>
        {child}
      </RelayRouterContext>
    );
  },

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
