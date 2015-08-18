const invariant = require('invariant');

function patchRouteQuery(oldQueryName, newQueryName, query) {
  return eval(`(function(Relay) { return ${query.toString().replace(
    /getFragment\((\S*?)\)/,
    `getFragment(${JSON.stringify(newQueryName)})`
  )}; })`);
}

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
      const { Component, Route } = this.state;

      return (<Relay.RootContainer
                Component={Component}
                route={new Route(this.props.params)}
              />);
    }

    _generateContainer(newProps) {
      const { branch, components } = newProps;

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

      class NestedRoute extends Relay.Route {
        static queries = queries;
        static routeName = 'NestedRoute';
      }

      return { Component: NestedRendererContainer, Route: NestedRoute };
    }
  }
}
