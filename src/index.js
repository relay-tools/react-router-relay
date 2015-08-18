import generateContainer from './generateContainer';

export default function generateRootContainer(React, Relay) {
  return class NestedRootContainer extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = generateContainer(React, Relay, props);
    }

    componentWillReceiveProps(props) {
      this.setState(generateContainer(React, Relay, props));
    }

    render() {
      const {Component, route} = this.state;
      const {childRoutes, component, ...props} = this.props.route;

      return (
        <Relay.RootContainer
          {...props}
          Component={Component}
          route={route}
        />
      );
    }
  };
}
