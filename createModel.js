const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const csv = require('csv-parser');
const fs = require('fs');

const MAX_SEQUENCE_LENGTH = 50;
const MAX_NUM_WORDS = 10000;
const EMBEDDING_DIM = 100;
const LSTM_UNITS = 128;
const DROPOUT_RATE = 0.2;

const queries = [];
const responses = [];

fs.createReadStream('ecommerce_customer_support.csv')
  .pipe(csv())
  .on('data', (data) => {
    queries.push(data.Query);
    responses.push(data.Response);
  })
  .on('end', () => {
    // const tokenizer = tf.data.text.wordTokenizer();
    const natural = require('natural');

    const tokenizer = new natural.WordTokenizer();
    console.log('tokenizer:::',tokenizer);
    const sequences = queries.map(sentence => tokenizer.tokenize(sentence));
    console.log('sequences::', sequences);
    console.log('tf.data:::',tf.data);
    return
    const paddedSequences = tf.data.util.padSequences(sequences, {
      padding: 'post',
      truncating: 'post',
      maxLength: MAX_SEQUENCE_LENGTH
    });

    const labels = tf.oneHot(tf.tensor1d(responses), 2);

    const data = tf.data.generator(function* () {
      for (let i = 0; i < queries.length; ++i) {
        yield {
          x: paddedSequences.slice([i, 0], [1, MAX_SEQUENCE_LENGTH]),
          y: labels.slice([i, 0], [1, 2])
        }
      }
    });

    const dataset = data.shuffle(queries.length).batch(32);

    const splitIndex1 = Math.floor(0.6 * queries.length);
    const splitIndex2 = Math.floor(0.8 * queries.length);

    const trainDataset = dataset.take(splitIndex1);
    const valDataset = dataset.skip(splitIndex1).take(splitIndex2 - splitIndex1);
    const testDataset = dataset.skip(splitIndex2);

    const model = tf.sequential();
    model.add(tf.layers.embedding({
      inputDim: tokenizer.vocabSize(),
      outputDim: EMBEDDING_DIM,
      inputLength: MAX_SEQUENCE_LENGTH
    }));
    model.add(tf.layers.lstm({
      units: LSTM_UNITS
    }));
    model.add(tf.layers.dropout({
      rate: DROPOUT_RATE
    }));
    model.add(tf.layers.dense({
      units: 2,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    model.fit(trainDataset, {
      epochs: 10,
      validationData: valDataset
    }).then((history) => {
      console.log(history.history);
    });

    model.evaluate(testDataset).then((result) => {
      const accuracy = result[1];
      console.log(`Test accuracy: ${accuracy * 100}%`);
    });
  });
