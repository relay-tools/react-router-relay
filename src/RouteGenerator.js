import * as Immutable from 'immutable';

export default class RouteGenerator {
  constructor() {
    this._routeToIndexMap = new Immutable.Map();
  }

  getRouteFor(branch) {
    return '$$_' + branch.map(route => {
      let id = this._routeToIndexMap.get(route);
      if (!id) {
        id = this._routeToIndexMap.size;
        this._routeToIndexMap = this._routeToIndexMap.set(route, id);
      }
      return id;
    }).join('.');
  }
}
