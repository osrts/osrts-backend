/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

server.on('listening', () => {
  console.log(`Feathers application started on ${app.get('host')}:${port}`);
  console.log(`Started in ${process.env.NODE_ENV}`);
});
