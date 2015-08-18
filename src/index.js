import generateContainer from './generateContainer';

export default function generateRootContainer(React, Relay) {
  return class NestedRootContainer extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = generateContainer(React, Relay, props);
    }

    componentWillReceiveProps(props) {
      if (props.isTransitioning) {
        return;
      }

      this.setState(generateContainer(React, Relay, props));
    }

    render() {
      const { Component, route } = this.state;

      return (
        <Relay.RootContainer
          {...this.props}
          Component={Component}
          route={{ ...route, params: this.props.params }}/>
      );
    }
  };
}
