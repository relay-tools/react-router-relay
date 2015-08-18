export default function generateNestedRenderer(React, components, fragmentNames) {
  return class NestedRenderer extends React.Component {
    static getFragmentNames() {
      return fragmentNames;
    }

    // Hackishly satisfy isRelayContainer.
    static getQuery() {}
    static getQueryNames() {}

    render() {
      return components.reduceRight((children, generateComponent) => {
        return generateComponent.call(this, { children: children });
      }, null);
    }
  };
}
