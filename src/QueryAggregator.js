export default class QueryAggregator {
  constructor() {
    this._reset();
  }

  _reset() {
    this._queryIdx = 0;
    this._queries = {};
    this._fragments = {};
  }

  add(Component, queries) {
    Object.keys(queries).forEach(queryName => {
      const generatedName = `$$_${queryName}_${++this._queryIdx}`;
      this._queries[generatedName] = (_, ...args) =>
        queries[queryName](Component, ...args);
      this._fragments[generatedName] =
        (...args) => Component.getFragment(queryName, ...args);
    });
  }

  flush() {
    const config = {
      queries: this._queries,
      fragments: this._fragments
    };

    this._reset();
    return config;
  }
}
