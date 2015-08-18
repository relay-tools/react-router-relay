import invariant from 'invariant';
import warning from 'warning';

import generateNestedRenderer from './NestedRenderer';

function getRouteName(branch) {
  const path = branch.map(leaf => leaf.path).join('');
  invariant(
    path && path.length > 0,
    'relay-nested-routes: Leaf route with components `%s` is missing ' +
    '`path` props required by relay-nested-routes.',
    branch.map(leaf => leaf.component).map(component => {
      return component.displayName || component.name;
    }).join(' -> ')
  );
  return path;
}

export default function generateContainer(React, Relay, newProps){
  const {branch, components} = newProps;
  const name = getRouteName(branch);

  const params = {...newProps.location.query, ...newProps.params};
  const rootQueries = {};
  const fragmentSpecs = {};
  let queryIdx = 0;

  const [, ...elements] = components.map((Component, index) => {
    if (!Relay.isContainer(Component)) {
      return (props) => <Component {...props}/>;
    }

    const componentName = Component.displayName || Component.name;
    const {queries} = branch[index];

    invariant(
      queries,
      'relay-nested-routes: Route with component `%s` is missing a ' +
      '`queries` prop: <Route component={%s} queries={...} /> or ',
      componentName,
      componentName
    );

    const fragmentResolvers = [];
    Object.keys(queries).forEach(queryName => {
      warning(
        !params[queryName],
        'relay-nested-routes: Route with component `%s` has a fragment and a ' +
        'parameter named `%s`. If you meant to override an initialVariable ' +
        'then rename one of them.',
        componentName,
        queryName
      );
      const generatedName = `$$_${name}_${queryName}_${++queryIdx}`;
      const resolve = function() {
        return this.props[generatedName];
      };
      rootQueries[generatedName] = (_, ...args) =>
        queries[queryName](Component, ...args);
      fragmentSpecs[generatedName] = {Component, queryName};
      fragmentResolvers.push({queryName, resolve});
    });

    return function ComponentRenderer(props) {
      const clonedProps = {...props};
      fragmentResolvers.forEach(
        ({queryName, resolve}) => clonedProps[queryName] = resolve.call(this)
      );
      return <Component {...params} {...clonedProps} />;
    };
  });

  return {
    Component: generateNestedRenderer(React, elements, fragmentSpecs),
    route: {
      name,
      params: params,
      queries: rootQueries
    }
  };
}
