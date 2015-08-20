export default {
  getFragmentNames() {
    if (!this._fragmentNames) {
      this._fragmentNames = Object.keys(this.fragments);
    }
    return this._fragmentNames;
  },
  getFragment(name, ...args) {
    return this.fragments[name](...args);
  },
  // TODO: Remove when Relay>0.1.1 is released (facebook/relay#103),
  // since getFragmentNames and getFragment fulfill the isContainer contract
  getQuery() {},
  getQueryNames() {},
};
