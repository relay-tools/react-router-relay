import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Relay from 'react-relay';
import RelayLocalSchema from 'relay-local-schema';
import { createMemoryHistory, Route } from 'rrtr';

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
        const { widget, first, second, third } = this.props;

        return (
          <div className={widget.name}>
            {first}
            {second}
            {third}
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

    // FIXME: Upgrade dependencies and get rid of this silly pragma.
    /* eslint-disable react/jsx-no-bind */
    const routes = (
      <Route
        path="/"
        component={WidgetContainer}
        getQueries={() => ({
          widget: () => Relay.QL`query { widget }`,
        })}
      >
        <Route
          path=":pathName"
          components={{
            first: WidgetContainer,
            second: WidgetContainer,
            third: WidgetContainer,
          }}
          queries={{
            first: {
              widget: () => Relay.QL`query { widgetByArg(name: $pathName) }`,
            },
            second: {
              widget: () => Relay.QL`query { widgetByArg(name: $queryName) }`,
            },
            third: {
              widget: () => Relay.QL`query { widgetByArg(name: $pathName) }`,
            },
          }}
          renderFetched={{
            third: () => <div className="qux" />,
          }}
          queryParams={['queryName']}
        />
      </Route>
    );
    /* eslint-enable react/jsx-no-bind */

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
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'foo');
    });

    it('should support path params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'bar');
    });

    it('should support query params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'baz');
    });

    it('should support renderFetched', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'qux');
    });
  });
});
