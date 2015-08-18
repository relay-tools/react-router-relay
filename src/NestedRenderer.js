export default function generateNestedRenderer(React, components, fragmentSpecs) {
  const fragmentNames = Object.keys(fragmentSpecs);

  return class NestedRenderer extends React.Component {
    static getFragmentNames() {
      return fragmentNames;
    }

    static getFragment(proxiedFragmentName, ...args) {
      const {Component, queryName} = fragmentSpecs[proxiedFragmentName];
      return Component.getFragment(queryName, ...args);
    }

    // Hackishly satisfy isRelayContainer.
    static getQuery() {}
    static getQueryNames() {}

    render() {
      return components.reduceRight(
        (children, generate) => generate.call(this, {children}),
        null
      );
    }
  };
}
