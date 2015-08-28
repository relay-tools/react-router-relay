import React from 'react';

import Container from './Container';

export default function createElement(Component, props) {
  return (
    <Container
      Component={Component}
      {...props}
    />
  );
}
