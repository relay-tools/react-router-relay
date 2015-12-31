import getBabelRelayPlugin from 'babel-relay-plugin';

import schema from './schema.json';

export default getBabelRelayPlugin(schema.data);
