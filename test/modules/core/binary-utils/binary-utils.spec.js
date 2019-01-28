/* eslint-disable max-len */
import test from 'tape-catch';
import {toArrayBuffer, toBuffer, toDataView} from '@loaders.gl/core';

test('toArrayBuffer', t => {
  t.ok(toArrayBuffer, 'toArrayBuffer defined');
  t.end();
});

test('toBuffer', t => {
  t.ok(toBuffer, 'toBuffer defined');
  t.end();
});

test('toDataView', t => {
  t.ok(toDataView, 'toDataView defined');
  t.end();
});
