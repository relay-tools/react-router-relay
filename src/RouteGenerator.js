import * as Immutable from 'immutable';

export default class RouteGenerator {
  constructor() {
    this._routeIdx = 0;
    this._routeToIndexMap = new WeakMap();
  }

  getRouteFor(branch) {
    return '$$_' + branch.map(route => {
      let id = this._routeToIndexMap.get(route);
      if (!id) {
        id = ++this._routeIdx;
        this._routeToIndexMap.set(route, id);
      }
      return id;
    }).join('.');
  }
}
