import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Relay from 'react-relay';
import { Route } from 'react-router';
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
    function StaticWidget(props) {
      return (
        <div className={props.static}/>
      );
    }

    class Widget extends React.Component {
      render() {
        const { widget, first, second, third, hello } = this.props;

        return (
          <div className={widget.name}>
            <div className={hello} />
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

    const routes = (
      <Route
        path="/"
        component={WidgetContainer}
        props={{ hello: 'World' }}
        queries={{
          widget: () => Relay.QL`query { widget }`,
        }}
      >
        <Route
          path=":pathName"
          components={{ first: WidgetContainer, second: WidgetContainer, third: StaticWidget }}
          queries={{
            first: { widget: () => Relay.QL`query { widgetByArg(name: $pathName) }` },
            second: { widget: () => Relay.QL`query { widgetByArg(name: $queryName) }` },
          }}
          queryParams={['queryName']}
          props={{ static: 'Hello' }}
        />
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
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'foo');
    });

    it('should support path params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'bar');
    });

    it('should support query params', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'baz');
    });

    it('should support properties on RelayContainers', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'World');
    });

    it('should support properties on non-Relay Components', () => {
      ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'Hello');
    });
  });
});
