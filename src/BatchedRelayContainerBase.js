import React from 'react';

export default class BatchedRelayContainerBase extends React.Component {
  static getFragmentNames() {
    if (!this._fragmentNames) {
      this._fragmentNames = Object.keys(this.fragments);
    }
    return this._fragmentNames;
  }

  static getFragment(name, ...args) {
    return this.fragments[name](...args);
  }

  // TODO: Remove when Relay>0.1.1 is released (facebook/relay#103),
  // since getFragmentNames and getFragment fullfill the isContainer contract
  static getQuery() {}
  static getQueryNames() {}

  render() {
    return this.constructor.childElement;
  }
}
