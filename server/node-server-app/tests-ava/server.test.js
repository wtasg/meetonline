import test from 'ava';

import { SERVER_PORT } from '../src/server.js';

test("server", t => {
    t.deepEqual(SERVER_PORT, 9006);
});
