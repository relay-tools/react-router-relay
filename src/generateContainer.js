import generateNestedRenderer from './NestedRenderer';
import invariant from 'invariant';

export default function generateContainer(React, Relay, newProps) {
  const { branch, components } = newProps;

  const queries = {};
  const fragments = {};
  const allRouteNames = [];
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

      const routeName = route.name;
      allRouteNames.push(routeName);

      Object.keys(route.queries).forEach(queryName => {
        const newQueryName = `Nested_${routeName}_${queryName}_${++queryIdx}`;
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
    name: ['Nested', ...allRouteNames].join('_'),
    queries
  };

  return {
    Component: generateNestedRenderer(React, elems, fragments),
    route
  };
}
