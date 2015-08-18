import invariant from 'invariant';
import warning from 'warning';

import generateNestedRenderer from './NestedRenderer';

function getRouteName(branch) {
  const leaf = branch[branch.length - 1];
  const {path} = leaf;
  invariant(
    path && path.length > 0,
    'relay-nested-routes: Leaf route with component `%s` is missing a ' +
    '`path` prop required by relay-nested-routes.',
    leaf.displayName || leaf.name
  );
  return path;
}

export default function generateContainer(React, Relay, newProps){
  const {branch, components} = newProps;
  const name = getRouteName(branch);

  const params = {...newProps.params, ...newProps.location.query};
  const rootQueries = {};
  let queryIdx = 0;

  const [, ...elements] = components.map((Component, index) => {
    if (!Relay.isContainer(Component)) {
      return (props) => <Component {...props}/>;
    }

    const componentName = Component.displayName || Component.name;
    const currentNode = branch[index];

    const {route: Route} = currentNode;
    let {queries} = currentNode;

    invariant(
      Route || queries,
      'relay-nested-routes: Route with component `%s` is missing a ' +
      '`queries` or `route` prop: ' +
      '<Route component={%s} queries={...} /> or ' +
      '<Route component={%s} route={...} />',
      componentName,
      componentName,
      componentName
    );
    invariant(
      !(Route && queries),
      'relay-nested-routes: Route with component `%s` defines both a ' +
      '`route` and `queries` class.',
      componentName
    );

    if (Route) {
      // Explicitly constructing the route from the class allows us to re-use
      // any invariants like required params on the route constructor.
      queries = new Route(params).queries;
    }

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
    Component: generateNestedRenderer(React, elements, rootQueries),
    route: {
      name,
      params: params,
      queries: rootQueries
    }
  };
}
