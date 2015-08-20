import invariant from 'invariant';
import React from 'react';
import Relay from 'react-relay';

import batchedRelayContainerBase from './batchedRelayContainerBase';

export function createBatchedRelayContainer(
    children,
    params,
    rootContainerProps,
    name,
    queryAggregator
) {
  const {queries, fragments} = queryAggregator.flush();
  const BatchedRelayContainer = {fragments, ...batchedRelayContainerBase};
  const route = {name, queries, params};
  const {
    renderFetched = (data, Component, children) => children
  } = rootContainerProps;

  return (
    <Relay.RootContainer
      Component={BatchedRelayContainer}
      route={route}
      {...rootContainerProps}
      renderFetched={data => renderFetched(data, null, children)}
    />
  );
}

export function createContainerElement(
  Component,
  props,
  params,
  rootContainerProps,
  name,
  queryAggregator
) {
  const {queries} = props.route;
  invariant(
    queries,
    'react-router-relay: Route with component `%s` is missing required ' +
    '`queries` prop.'
  );

  const route = {name, queries, params};
  queryAggregator.add(Component, queries);
  const {
    renderFetched = (data, Component, children) => (
      <Component {...props} {...data} />
    )
  } = rootContainerProps;

  return (
    <Relay.RootContainer
      Component={Component}
      route={route}
      {...rootContainerProps}
      renderFetched={data => renderFetched(data, Component, null)}
    />
  );
}
