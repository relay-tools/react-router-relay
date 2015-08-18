import generateNestedRenderer from './NestedRenderer';
const invariant = require('invariant');

const CACHED_CONTAINERS = {};

function generateRouteName(components) {
  return `Nested_${
    components.map(component => component.displayName).join('_')
  }`;
}

export default function generateContainer(React, Relay, newProps) {
  const { branch, components } = newProps;
  const routeName = generateRouteName(components);

  if (CACHED_CONTAINERS[routeName]) {
    return CACHED_CONTAINERS[routeName];
  }

  const queries = {};
  const fragments = {};
  let queryIdx = 0;

  const [, ...elems] = components.map((Component, index) => {
    const fragmentResolvers = [];

    if (Relay.isContainer(Component)) {
      const { route } = branch[index];
      invariant(
        route,
        `relay-nested-routes: Route with component ` +
        `\`${Component.displayName}\` is missing a route prop: ` +
        `<Route component={${Component.displayName}} route={...}/>`
      );

      Object.keys(route.queries).forEach(queryName => {
        const newQueryName = `Nested_${route.name}_${queryName}_${++queryIdx}`;
        fragments[newQueryName] = queries[newQueryName] = (_, ...args) => {
          return route.queries[queryName](Component, ...args);
        };
        fragmentResolvers.push({
          prop: queryName,
          resolve: function getLocalProp() {
            return this.props[newQueryName];
          }
        });
      });
    }

    return function ComponentGenerator(props) {
      fragmentResolvers.forEach(fragment => {
        props[fragment.prop] = fragment.resolve.call(this);
      });

      return <Component {...props}/>;
    };
  });

  const route = {
    name: routeName,
    queries
  };

  const state = CACHED_CONTAINERS[routeName] = {
    Component: generateNestedRenderer(React, elems, fragments),
    route
  };
  return state;
}
