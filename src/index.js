const invariant = require('invariant');

// Super nasty way to rename the fragment until facebook/relay#20 is solved.
function patchRouteQuery(oldQueryName, newQueryName, query) {
  return eval(`(function(Relay) { return ${query.toString().replace(
    /getFragment\((\S*?)\)/,
    `getFragment(${JSON.stringify(newQueryName)})`
  )}; })`);
}

function generateRouteName(components) {
  return `Nested_${
    components.map(component => component.displayName).join('_')
  }`;
}

const CACHED_STATES = {};

export default function generateRootContainer(React, Relay) {
  return class NestedRootContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = this._generateContainer(props);
    }

    componentWillReceiveProps(props) {
      this.setState(this._generateContainer(props));
    }

    render() {
      const { Component, route } = this.state;

      return (
        <Relay.RootContainer
          Component={Component}
          route={{ ...route, params: this.props.params }}/>
      );
    }

    _generateContainer(newProps) {
      const { branch, components } = newProps;
      const routeName = generateRouteName(components);

      if (CACHED_STATES[routeName]) {
        return CACHED_STATES[routeName];
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
            'Routes with Relay.Containers must include a `route` prop.'
          );

          Object.keys(route.queries).forEach(queryName => {
            const newQueryName = `Nested_${route.routeName}_${queryName}_${++queryIdx}`;
            queries[newQueryName] = patchRouteQuery(
              queryName,
              newQueryName,
              route.queries[queryName]
            ).call(undefined, Relay);
            const fragment = Component.getFragment(queryName)._fragmentGetter;
            fragments[newQueryName] = () => fragment();
            fragmentResolvers.push({
              prop: queryName,
              resolve: function getLocalProp() {
                return this.props[newQueryName];
              },
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

      class NestedRenderer extends React.Component {
        render() {
          return elems.reduceRight((children, generateComponent) => {
            return generateComponent.call(this, { children: children });
          }, null);
        }
      }

      const NestedRendererContainer = Relay.createContainer(NestedRenderer, {
        fragments,
      });

      const route = {
        name: routeName,
        queries,
      };

      const state = CACHED_STATES[routeName] = {
        Component: NestedRendererContainer,
        route,
      };
      return state;
    }
  };
}
