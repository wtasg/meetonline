import test from 'ava';

import { SERVER_PORT } from '../src/config.js';

test("config", t => {
    t.deepEqual(SERVER_PORT, 9006);
});
