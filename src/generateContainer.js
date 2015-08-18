import invariant from 'invariant';

import generateNestedRenderer from './NestedRenderer';

const CACHE = {};

function generateRouteName(components) {
  return `$$_${components.map(component => component.displayName).join('_')}`;
}

export default function generateContainer(React, Relay, newProps){
  const {branch, components} = newProps;
  const name = generateRouteName(components);

  if (CACHE[name]) {
    return CACHE[name];
  }

  const rootQueries = {};
  const fragments = {};
  let queryIdx = 0;

  const [, ...elements] = components.map((Component, index) => {
    const fragmentResolvers = [];

    if (Relay.isContainer(Component)) {
      const {queries, name: routeName} = branch[index];
      invariant(
        queries,
        'relay-nested-routes: Route with component `%s` is missing a ' +
        '`queries` prop: <Route component={%s} queries={...} />.',
        Component.displayName,
        Component.displayName
      );

      Object.keys(queries).forEach(queryName => {
        const generatedName = `$$_${routeName}_${queryName}_${++queryIdx}`;
        const resolve = function() {
          return this.props[generatedName];
        };
        fragments[generatedName] = rootQueries[generatedName] = (_, ...args) =>
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
    Component: generateNestedRenderer(React, elements, fragments),
    route: {
      name,
      params: newProps.params,
      queries: rootQueries
    }
  };
}
