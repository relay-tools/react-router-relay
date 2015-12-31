// FIXME: This should just be babel/polyfill, but for some reason importing
// that here doesn't work.
import 'array.prototype.find';

const testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
