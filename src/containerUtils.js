import invariant from 'invariant';
import React from 'react';
import Relay from 'react-relay';

import BatchedRelayContainerBase from './BatchedRelayContainerBase';

export function createBatchedRelayContainer(
    childElement,
    params,
    routeName,
    queryBatcher
) {
  const {queries, fragments} = queryBatcher.flush();
  const route = {name: routeName, queries, params};

  class BatchedRelayContainer extends BatchedRelayContainerBase {
    static childElement = childElement;
    static fragments = fragments;
  }

  return (
    <Relay.RootContainer
      Component={BatchedRelayContainer}
      route={route}
    />
  );
}

export function createContainerElement(
  Component,
  props,
  params,
  routeName,
  queryBatcher
) {
  const {queries} = props.route;
  invariant(
    queries,
    'relay-nested-routes: Component is missing queries prop!'
  );

  const route = {name: routeName, queries, params};
  queryBatcher.add(Component, queries);

  return (
    <Relay.RootContainer
      Component={Component}
      route={route}
      renderFetched={data => (
        <Component {...props} {...data} />
      )}
    />
  );
}
