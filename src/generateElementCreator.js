import React from 'react';
import Relay from 'react-relay';

import * as Utils from './containerUtils';
import QueryAggregator from './QueryAggregator';
import getRouteParams from './getRouteParams';
import RouteGenerator from './RouteGenerator';
import getRelayRootProps from './getRelayRootProps';

export default function generateElementCreator() {
  const queryAggregator = new QueryAggregator();
  const routeGenerator = new RouteGenerator();

  return function createElement(Component, props) {
    const {branch, route, params, location, routeParams} = props;

    // Wrap any Relay.Containers
    let element = !Relay.isContainer(Component) ? <Component {...props} /> :
      Utils.createContainerElement(
        Component,
        props,
        getRouteParams(routeParams, location.query, route.queryParams),
        getRelayRootProps(route),
        routeGenerator.getRouteFor(branch),
        queryAggregator
      );

    // Wrap the root component in a RootContainer
    element = route !== branch[0] ? element :
      Utils.createBatchedRelayContainer(
        element,
        getRouteParams(params, location.query, route.queryParams),
        getRelayRootProps(route),
        routeGenerator.getRouteFor(branch),
        queryAggregator
      );

    return element;
  };
}
