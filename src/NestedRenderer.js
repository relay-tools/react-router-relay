export default function generateNestedRenderer(React, components, fragments) {
  const fragmentNames = Object.keys(fragments);

  return class NestedRenderer extends React.Component {
    static getFragmentNames() {
      return fragmentNames;
    }

    static getFragment(fragmentName) {
      return fragments[fragmentName];
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
