import invariant from 'invariant';
import React from 'react';
import Relay from 'react-relay';

import batchedRelayContainerBase from './batchedRelayContainerBase';

export function createBatchedRelayContainer(
    children,
    params,
    name,
    queryAggregator
) {
  const {queries, fragments} = queryAggregator.flush();
  const BatchedRelayContainer = {fragments, ...batchedRelayContainerBase};
  const route = {name, queries, params};
  const render = () => children;

  return (
    <Relay.RootContainer
      Component={BatchedRelayContainer}
      route={route}
      renderFailure={render}
      renderLoading={render}
      renderFetched={render}
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

  const renderFetched = rootContainerProps.renderFetched
    || ((data, props) => <Component {...props} {...data} />);

  return (
    <Relay.RootContainer
      Component={Component}
      route={route}
      {...rootContainerProps}
      renderFetched={data => renderFetched(data, props)}
    />
  );
}
