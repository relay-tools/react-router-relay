import invariant from 'invariant';
import React from 'react';
import Relay from 'react-relay';

import batchedRelayContainerBase from './BatchedRelayContainerBase';

export function createBatchedRelayContainer(
    childElement,
    params,
    rootProps,
    routeName,
    queryAggregator
) {
  const {queries, fragments} = queryAggregator.flush();
  const BatchedRelayContainer = {fragments, ...batchedRelayContainerBase};
  const route = {name: routeName, queries, params};
  const {renderFetched = (data, Component, children) => children} = rootProps;

  return (
    <Relay.RootContainer
      Component={BatchedRelayContainer}
      route={route}
      {...rootProps}
      renderFetched={data => renderFetched(data, null, childElement)}
    />
  );
}

export function createContainerElement(
  Component,
  props,
  params,
  rootProps,
  routeName,
  queryAggregator
) {
  const {queries} = props.route;
  invariant(
    queries,
    'react-router-relay: Route with component `%s` is missing required ' +
    '`queries` prop.'
  );

  const route = {name: routeName, queries, params};
  queryAggregator.add(Component, queries);
  const {
    renderFetched = (data, Component, children) => (
      <Component {...props} {...data} />
    )
  } = rootProps;

  return (
    <Relay.RootContainer
      Component={Component}
      route={route}
      {...rootProps}
      renderFetched={data => renderFetched(data, Component, null)}
    />
  );
}
