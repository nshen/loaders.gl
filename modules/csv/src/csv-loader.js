import {AsyncQueue} from '@loaders.gl/experimental';
import {TableBatchBuilder, RowTableBatch} from '@loaders.gl/experimental/categories/table';
import Papa from './papaparse/papaparse.transpiled';
import AsyncIteratorStreamer from './papaparse/async-iterator-streamer';

export default {
  name: 'CSV',
  extensions: ['csv'],
  testText: null,
  parseTextSync: parseCSVSync,
  parseInBatches: parseCSVInBatches,
  options: {
    TableBatch: RowTableBatch
  }
};

function parseCSVSync(csvText, options) {
  const config = Object.assign(
    {
      header: hasHeader(csvText, options),
      dynamicTyping: true // Convert numbers and boolean values in rows from strings
    },
    options,
    {
      download: false, // We handle loading, no need for papaparse to do it for us
      error: e => {
        throw new Error(e);
      }
    }
  );

  const result = Papa.parse(csvText, config);
  return result.data;
}

// TODO - support batch size 0 = no batching/single batch?
function parseCSVInBatches(asyncIterator, options) {
  // options
  const {batchSize = 10} = options;

  const TableBatchType = options.TableBatch;
  const asyncQueue = new AsyncQueue();

  let isFirstRow = true;
  let headerRow = null;
  let tableBatchBuilder = null;
  let schema = null;

  const config = {
    download: false, // We handle loading, no need for papaparse to do it for us
    dynamicTyping: true, // Convert numbers and boolean values in rows from strings
    header: false, // Unfortunately, header detection is not automatic and does not infer types

    // chunk(results, parser) {
    //   // TODO batch before adding to queue.
    //   console.log('Chunk:', results, parser);
    //   asyncQueue.enqueue(results.data);
    // },

    // step is called on every row
    step(results, parser) {
      const row = results.data;

      // Check if we need to save a header row
      if (isFirstRow && !headerRow) {
        const header = options.header === undefined ? isHeaderRow(row) : options.header;
        if (header) {
          headerRow = row;
          return;
        }
      }

      // If first data row, we can deduce the schema
      if (isFirstRow) {
        isFirstRow = false;
        schema = deduceSchema(row, headerRow);
      }

      // Add the row
      tableBatchBuilder =
        tableBatchBuilder || new TableBatchBuilder(TableBatchType, schema, batchSize);

      tableBatchBuilder.addRow(row);
      // If a batch has been completed, emit it
      if (tableBatchBuilder.isFull()) {
        asyncQueue.enqueue(tableBatchBuilder.getNormalizedBatch());
      }
    },

    // complete is called when all rows have been read
    complete(results, file) {
      // Ensure any final (partial) batch gets emitted
      const batch = tableBatchBuilder.getNormalizedBatch();
      if (batch) {
        asyncQueue.enqueue(batch);
      }
      asyncQueue.close();
    }
  };

  Papa.parse(asyncIterator, config, AsyncIteratorStreamer);

  // TODO - Does it matter if we return asyncIterable or asyncIterator
  // return asyncQueue[Symbol.asyncIterator]();
  return asyncQueue;
}

function isHeaderRow(row) {
  return row.every(value => typeof value === 'string');
}

function hasHeader(csvText, options) {
  if ('header' in options) {
    return options.header;
  }

  let header = false;
  Papa.parse(csvText, {
    download: false,
    dynamicTyping: true,
    step: (results, parser) => {
      const row = results.data;
      header = isHeaderRow(row);
      parser.abort();
    }
  });

  return header;
}

function deduceSchema(row, headerRow) {
  const schema = headerRow ? {} : [];
  for (let i = 0; i < row.length; i++) {
    const columnName = (headerRow && headerRow[i]) || i;
    const value = row[i];
    switch (typeof value) {
      case 'number':
      case 'boolean':
        // TODO - booleans could be handled differently...
        schema[columnName] = {name: String(columnName), index: i, type: Float32Array};
        break;
      case 'string':
      default:
        schema[columnName] = {name: String(columnName), index: i, type: Array};
      // We currently only handle numeric rows
      // TODO we could offer a function to map strings to numbers?
    }
  }
  return schema;
}
