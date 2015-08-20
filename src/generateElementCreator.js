import React from 'react';
import Relay from 'react-relay';

import * as Utils from './containerUtils';
import QueryBatcher from './QueryBatcher';
import defaultGetParams from './defaultGetParams';
import RouteGenerator from './RouteGenerator';

export default function generateElementCreator(getParams = defaultGetParams) {
  const queryBatcher = new QueryBatcher();
  const routeGenerator = new RouteGenerator();

  return function createElement(Component, props) {
    const {branch, route, params, location, routeParams} = props;

    // Wrap any Relay.Containers
    let element = !Relay.isContainer(Component) ? <Component {...props} /> :
      Utils.createContainerElement(
        Component,
        props,
        getParams(routeParams, location.query),
        routeGenerator.getRouteFor(branch),
        queryBatcher
      );

    // Wrap the root component in a RootContainer
    element = route !== branch[0] ? element :
      Utils.createBatchedRelayContainer(
        element,
        getParams(params, location.query),
        routeGenerator.getRouteFor(branch),
        queryBatcher
      );

    return element;
  };
}
