import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import Relay from 'react-relay/classic';
import { applyRouterMiddleware, createMemoryHistory, Route, Router }
  from 'react-router';
import RelayLocalSchema from 'relay-local-schema';

import useRelay from '../src';

import schema from './fixtures/schema';

describe('useRelay', () => {
  let environment;

  beforeEach(() => {
    environment = new Relay.Environment();
    environment.injectNetworkLayer(
      new RelayLocalSchema.NetworkLayer({ schema }),
    );
  });

  describe('kitchen sink', () => {
    function Root({ children }) {
      return React.cloneElement(children, { extraProp: 3 });
    }

    function WidgetParent({ widget, first, second, third, fourth }) {
      return (
        <div className={widget.name}>
          {first}
          {second}
          {third}
          {fourth}
        </div>
      );
    }

    const WidgetParentContainer = Relay.createContainer(WidgetParent, {
      fragments: {
        widget: () => Relay.QL`
          fragment on Widget {
            name
          }
        `,
      },
    });

    function Widget({ widget, route }) {
      expect(route).to.be.ok;

      return (
        <div className={widget.name} />
      );
    }

    const WidgetContainer = Relay.createContainer(Widget, {
      fragments: {
        widget: () => Relay.QL`
          fragment on Widget {
            name
          }
        `,
      },
    });

    const components = {
      first: WidgetContainer,
      second: WidgetContainer,
      third: WidgetContainer,
      fourth: WidgetContainer,
    };

    const queries = {
      first: {
        widget: () => Relay.QL`query { widgetByArg(name: $pathName) }`,
      },
      second: {
        widget: () => Relay.QL`query { widgetByArg(name: $queryName) }`,
      },
      third: {
        widget: () => Relay.QL`query { widget }`,
      },
      fourth: {
        widget: () => Relay.QL`query { widgetByArg(name: $parentName) }`,
      },
    };

    const render = {
      third: () => <div className="qux" />,
    };

    let renderSpy;
    let instance;

    beforeEach((done) => {
      // This is declared on the parent route to capture the loading lifecycle,
      // because we don't render the child routes until the parent route is
      // ready.
      renderSpy = sinon.spy(({ props }) => (
        props && <WidgetParentContainer {...props} />
      ));

      const routes = (
        <Route path="/:parentName" component={Root}>
          <Route
            component={WidgetParentContainer}
            getQueries={() => ({
              widget: () => Relay.QL`query { widget }`,
            })}
            render={renderSpy}
            prepareParams={({ parentName, ...params }) => ({
              ...params,
              parentName: `${parentName}-`,
            })}
          >
            <Route
              path=":pathName" components={components}
              queries={queries}
              render={render}
              prepareParams={(params, { location }) => ({
                ...params,
                queryName: location.query.name,
              })}
            />
          </Route>
        </Route>
      );

      class Component extends React.Component {
        onReadyStateChange(readyState) {
          if (!readyState.done) {
            return;
          }

          done();
        }

        render() {
          return (
            <Router
              history={createMemoryHistory('/parent/bar?name=baz')}
              routes={routes}
              render={applyRouterMiddleware(useRelay)}
              environment={environment}
              onReadyStateChange={this.onReadyStateChange}
            />
          );
        }
      }

      instance = ReactTestUtils.renderIntoDocument(<Component />);
    });

    describe('rendered components', () => {
      [
        ['basic use', 'foo'],
        ['path params', 'bar'],
        ['prepared params', 'baz'],
        ['render method', 'qux'],
        ['modified parent params', 'parent-'],
      ].forEach(([condition, className]) => {
        it(`should support ${condition}`, () => {
          ReactTestUtils.findRenderedDOMComponentWithClass(
            instance, className,
          );
        });
      });
    });

    describe('render arguments', () => {
      describe('before data are ready', () => {
        let renderArgs;

        beforeEach(() => {
          renderArgs = renderSpy.firstCall.args[0];
        });

        it('should not have Relay props', () => {
          expect(renderArgs.props).to.equal(null);
        });

        it('should have the correct ready state', () => {
          expect(renderArgs.done).to.not.be.ok;
        });

        it('should have router props', () => {
          expect(renderArgs.routerProps).to.exist;
          expect(renderArgs.routerProps.route).to.exist;
          expect(renderArgs.element).to.exist;
          expect(renderArgs.element.type).to.equal(WidgetParentContainer);
        });

        it('should support injected props', () => {
          expect(renderArgs.routerProps.extraProp).to.equal(3);
        });
      });

      describe('after data are ready', () => {
        let renderArgs;

        beforeEach(() => {
          renderArgs = renderSpy.lastCall.args[0];
        });

        it('should have Relay props', () => {
          expect(renderArgs.props).to.exist;
          expect(renderArgs.props.widget).to.exist;
        });

        it('should have the correct ready state', () => {
          expect(renderArgs.done).to.be.ok;
        });

        it('should have router props', () => {
          expect(renderArgs.props.route).to.exist;
          expect(renderArgs.routerProps).to.exist;
          expect(renderArgs.routerProps.route).to.exist;
          expect(renderArgs.element).to.exist;
          expect(renderArgs.element.type).to.equal(WidgetParentContainer);
        });

        it('should support injected props', () => {
          expect(renderArgs.props.extraProp).to.equal(3);
          expect(renderArgs.routerProps.extraProp).to.equal(3);
        });
      });
    });
  });
});
