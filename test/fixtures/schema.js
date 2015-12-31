import {
  GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString,
} from 'graphql';

const Widget = new GraphQLObjectType({
  name: 'Widget',
  fields: {
    name: {
      type: GraphQLString,
    },
  },
});

const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    widget: {
      type: Widget,
      resolve: () => ({ name: 'foo' }),
    },
    widgetByArg: {
      type: Widget,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (obj, { name }) => ({ name }),
    },
  },
});

export default new GraphQLSchema({ query });
