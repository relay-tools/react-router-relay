import invariant from 'invariant';

import generateNestedRenderer from './NestedRenderer';

const CACHE = {};

function getRouteName(branch) {
  const leaf = branch[branch.length - 1];
  const {path} = leaf;
  invariant(
    path && path.length > 0,
    'relay-nested-routes: Leaf route with component `%s` is missing a ' +
    '`path` prop required by relay-nested-routes.',
    leaf.displayName
  );
  return path;
}

export default function generateContainer(React, Relay, newProps){
  const {branch, components} = newProps;
  const name = getRouteName(branch);

  if (CACHE[name]) {
    return CACHE[name];
  }

  const rootQueries = {};
  let queryIdx = 0;

  const [, ...elements] = components.map((Component, index) => {
    const fragmentResolvers = [];

    if (Relay.isContainer(Component)) {
      const {queries} = branch[index];
      invariant(
        queries,
        'relay-nested-routes: Route with component `%s` is missing a ' +
        '`queries` prop: <Route component={%s} queries={...} />.',
        Component.displayName,
        Component.displayName
      );

      Object.keys(queries).forEach(queryName => {
        const generatedName = `$$_${name}_${queryName}_${++queryIdx}`;
        const resolve = function() {
          return this.props[generatedName];
        };
        rootQueries[generatedName] = (_, ...args) =>
          queries[queryName](Component, ...args);
        fragmentResolvers.push({queryName, resolve});
      });
    }

    return function ComponentRenderer(props) {
      var clonedProps = {...props};
      fragmentResolvers.forEach(
        ({queryName, resolve}) => clonedProps[queryName] = resolve.call(this)
      );
      return <Component {...clonedProps} />;
    };
  });

  return CACHE[name] = {
    Component: generateNestedRenderer(React, elements, rootQueries),
    route: {
      name,
      params: newProps.params,
      queries: rootQueries
    }
  };
}
