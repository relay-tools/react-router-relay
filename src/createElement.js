import React from 'react';

import Container from './Container';

export default function createElement(Component, props) {
  // TODO: Replace this hack with a proper way of reading routes.
  if (!props.location.hasRoutes) {
    const childRoutes = props.location.routes || [];
    props.location.routes = [props.route, ...childRoutes];
  }

  return (
    <Container
      Component={Component}
      {...props}
    />
  );
}
