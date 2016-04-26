import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Relay from 'react-relay';
import {
  applyRouterMiddleware, createMemoryHistory, Route, Router,
} from 'react-router';
import RelayLocalSchema from 'relay-local-schema';

import useRelay from '../src';

import schema from './fixtures/schema';

describe('useRelay', () => {
  let environment;

  beforeEach(() => {
    environment = new Relay.Environment();

    environment.injectNetworkLayer(
      new RelayLocalSchema.NetworkLayer({ schema })
    );
  });

  describe('kitchen sink', () => {
    const WidgetRoot = ({ widget, first, second, third, fourth, route }) => {
      expect(route).to.be.ok;

      return (
        <div className={widget.name}>
          {first}
          {second}
          {third}
          {fourth}
        </div>
      );
    };

    const WidgetRootContainer = Relay.createContainer(WidgetRoot, {
      fragments: {
        widget: () => Relay.QL`
          fragment on Widget {
            name,
          }
        `,
      },
    });

    const Widget = ({ widget, route }) => {
      expect(route).to.be.ok;

      return <div className={widget.name} />;
    };

    const WidgetContainer = Relay.createContainer(Widget, {
      fragments: {
        widget: () => Relay.QL`
          fragment on Widget {
            name,
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
      third: ({ props }) => {
        if (!props) {
          return null;
        }

        expect(props.route).to.be.ok;
        return <div className="qux" />;
      },
    };

    const routes = (
      <Route path="/:parentName">
        <Route
          component={WidgetRootContainer}
          getQueries={() => ({
            widget: () => Relay.QL`query { widget }`,
          })}
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

    let instance;

    beforeEach(done => {
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

    it('should support basic use', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'foo');
    });

    it('should support path params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'bar');
    });

    it('should support prepared params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'baz');
    });

    it('should support renderFetched', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'qux');
    });

    it('should support modified parent params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'parent-');
    });
  });
});
