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

  /*
    This is a hack that lets us batch up all of the queries from our
    query aggregator, while still allowing individual Relay.RootContainers
    to function properly (with e.g. renderLoading).

    If we rendered `children` inside of the aggregated RootContainer,
    then changing routes would disturb the entire page, rather than
    just being localized to any changing parts.
  */
  return (
    <div>
      <Relay.RootContainer
        Component={BatchedRelayContainer}
        route={route}
        renderFetched={() => null}
      />
      {children}
    </div>
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
    renderFetched = (data, props) => (
      <Component {...props} {...data} />
    )
  } = rootContainerProps;

  return (
    <Relay.RootContainer
      Component={Component}
      route={route}
      {...rootContainerProps}
      renderFetched={data => renderFetched(data, props)}
    />
  );
}
