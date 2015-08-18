import defaultGetParams from './defaultGetParams';
import generateNestedRenderer from './NestedRenderer';
import invariant from 'invariant';

export default function generateContainer(React, Relay, newProps) {
  const { branch, components } = newProps;

  const queries = {};
  const fragments = {};
  const allRouteNames = [];
  const params = {};
  let queryIdx = 0;

  const [, ...elems] = components.map((Component, index) => {
    if (!Relay.isContainer(Component)) {
      return props => <Component {...props}/>;
    }

    const componentName = Component.displayName || Component.name;

    const currentNode = branch[index];
    let { route } = currentNode;
    const { routeClass, params: getParams = defaultGetParams} = currentNode;

    // Not using XOR here allows better invariant error messages.
    invariant(
      route || routeClass,
      `relay-nested-routes: Route with component \`${componentName}\` is `+
      `missing a route or routeClass prop: ` +
      `<Route component={${componentName}} route={...}/> or` +
      `<Route component={${componentName}} routeClass={...}/> or`
    );
    invariant(
      !(route && routeClass),
      `relay-nested-routes: Route with component \`${componentName}\` ` +
      `specifies both route and routeClass`
    );

    const routeParams = getParams({
      params: newProps.params,
      query: newProps.location.query
    });
    Object.keys(routeParams).forEach(paramKey => {
      if (params[paramKey !== undefined]) {
        invariant(
          params[paramKey] === routeParams[paramKey],
          `relay-nested-routes: Route with component \`${componentName}\`` +
          ` has conflict on param \`${paramKey}\``
        );
      }

      params[paramKey] = routeParams[paramKey];
    });

    // Explicitly constructing the route from the class allows us to re-use
    // any invariants like required params on the route constructor.
    if (routeClass) {
      route = new routeClass(params);
    }

    const routeName = route.name;
    allRouteNames.push(routeName);

    const fragmentResolvers = [];

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

    return function ComponentGenerator(props) {
      fragmentResolvers.forEach(fragment => {
        props[fragment.prop] = fragment.resolve.call(this);
      });

      return <Component {...props} {...routeParams}/>;
    };
  });

  const route = {
    name: ['Nested', ...allRouteNames].join('_'),
    queries,
    params
  };

  return {
    Component: generateNestedRenderer(React, elems, fragments),
    route
  };
}
