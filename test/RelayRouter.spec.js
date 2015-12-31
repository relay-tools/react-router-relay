import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Relay from 'react-relay';
import { IndexRoute, Route } from 'react-router';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import RelayLocalSchema from 'relay-local-schema';

import { RelayRouter } from '../src';

import schema from './fixtures/schema';

describe('<RelayRouter>', () => {
  beforeEach(() => {
    Relay.injectNetworkLayer(
      new RelayLocalSchema.NetworkLayer({ schema })
    );
  });

  describe('kitchen sink', () => {
    class Widget extends React.Component {
      render() {
        const { route, widget, children } = this.props;

        return (
          <div>
            <div className={route.className}>
              {widget.name}
            </div>

            {children}
          </div>
        );
      }
    }

    const WidgetContainer = Relay.createContainer(Widget, {
      fragments: {
        widget: () => Relay.QL`
          fragment on Widget {
            name,
          }
        `,
      },
    });

    const routes = (
      <Route
        path="/"
        component={WidgetContainer}
        queries={{
          widget: () => Relay.QL`query { widget }`,
        }}
        className="basic"
      >
        <Route
          path=":pathName"
          component={WidgetContainer}
          queries={{
            widget: () => Relay.QL`query { widgetByArg(name: $pathName) }`,
          }}
          className="path"
        >
          <IndexRoute
            component={WidgetContainer}
            queries={{
              widget: () => Relay.QL`query { widgetByArg(name: $queryName) }`,
            }}
            queryParams={['queryName']}
            className="query"
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
            <RelayRouter
              history={createMemoryHistory('/bar?queryName=baz')}
              routes={routes}
              onReadyStateChange={this.onReadyStateChange}
            />
          );
        }
      }

      instance = ReactTestUtils.renderIntoDocument(<Component />);
    });

    it('should support basic use', () => {
      const node =
        ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'basic');
      expect(node.innerHTML).to.equal('foo');
    });

    it('should support path params', () => {
      const node =
        ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'path');
      expect(node.innerHTML).to.equal('bar');
    });

    it('should support query params', () => {
      const node =
        ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'query');
      expect(node.innerHTML).to.equal('baz');
    });
  });
});
