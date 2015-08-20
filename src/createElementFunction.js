import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import invariant from 'invariant';

import getRouteParams from './getRouteParams';
import Container from './Container';

function expectedProp(obj, prop, Component) {
  invariant(
    obj[prop],
    'react-router-relay: Expected route with component `%s` to provide a ' +
    '`%s` prop.',
    Component.displayName || Component.name,
    prop
  );
}

export function createElementFunction() {
  const nodeMap = {};
  return function createElement(Component, props) {
    if (!Relay.isContainer(Component)) {
      return <Component {...props} />;
    }

    expectedProp(props.route, 'name', Component);
    expectedProp(props.route, 'queries', Component);

    const {name, queries, rootContainerProps} = props.route;
    const params = getRouteParams(
      props.routeParams || {},
      props.location.query || {},
      props.route.queryParams || []
    );
    const route = {name, queries, params};
    const renderLoading = rootContainerProps.renderLoading ||
      (() => undefined);
    const renderFetched = rootContainerProps.renderFetched ||
      ((data) => <Component {...props} {...data} />);
    const renderFailure = rootContainerProps.renderFailure ||
      (() => null);

    const node = nodeMap[name] = nodeMap[name] || {
      content: null,
      element: null,
      ref: null,
      cleaner: null,
      route: null
    };

    // Maintain referential equality to keep prevent unnecessary
    // loading states on unaffected routes.
    if (!node.route || JSON.stringify(node.route) !== JSON.stringify(route)) {
      node.route = route;
    }

    const render = (fn, args) => {
      const content = fn(...args, Component, props);
      if (typeof content !== 'undefined') {
        // Undefined shouldn't overwrite existing content
        node.content = content;
      }
      if (node.ref) {
        setTimeout(() => {
          node.ref.setContent(content);
        }, 0);
      }
      return null;
    };

    node.element = node.element || document.createElement('div');
    setTimeout(() => {
      ReactDOM.render((
        <Relay.RootContainer
          Component={Component}
          route={node.route}
          renderLoading={(...args) => render(renderLoading, args)}
          renderFetched={(...args) => render(renderFetched, args)}
          renderFailure={(...args) => render(renderFailure, args)}
        />
      ), node.element);
    }, 0);

    const handler = (element) => {
      if (!element) {
        node.cleaner = setTimeout(() => {
          // Clean up anything that makes it to the next frame
          // without a new ref being handled
          ReactDOM.unmountComponentAtNode(node.element);
          delete nodeMap[name];
        }, 0);
      } else {
        clearTimeout(node.cleaner);
        node.cleaner = null;
        element.setContent(node.content);
      }
      node.ref = element;
    };

    return (
      <Container
        route={node.route}
        ref={handler}
        content={node.content}
      />
    );
  };
}
