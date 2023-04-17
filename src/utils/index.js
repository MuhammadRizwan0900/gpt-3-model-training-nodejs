const fs = require("fs");
const csv = require("csv-parser");
// const { Transformers } = require("@huggingface/hub");
const { Tokenizer } = require("tokenizers");
const tf = require("@tensorflow/tfjs-node");

// Load the dataset from a CSV file
const data = [];
fs.createReadStream("customer_support_dataset.csv")
  .pipe(csv())
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", () => {
    // Initialize the GPT-2 tokenizer
    const tokenizer = new Tokenizer.fromPretrained("gpt2");
    const preprocessedData = preprocessData(data, tokenizer);
    console.log('preprocessedData:', preprocessedData);
    // .then((tokenizer) => {
    //   // Preprocess the data
    //   const preprocessedData = preprocessData(data, tokenizer);
    //   console.log(preprocessedData);
    // }).catch((error) => {
    //   console.log(error);
    // });
  });

// Define a function to preprocess the data
function preprocessData(data, tokenizer) {
    console.log('data:::',data);
  // Tokenize the query and response text
   // Tokenize the query and response text
   const tokenizedQueries = data.map((row) => tokenizer.encode(row.query));
   console.log('tokenizedQueries::', tokenizedQueries);
   const tokenizedResponses = data.map((row) => tokenizer.encode(row.response.split(" "), { isPretokenized: true }));

  // Create input sequences by concatenating the tokenized query and response
  const inputIds = [];
  const attentionMasks = [];
  for (let i = 0; i < data.length; i++) {
    const inputSequence = tokenizedQueries[i].input_ids.concat(tokenizedResponses[i].input_ids.slice(1));
    const attnMask = Array(inputSequence.length).fill(1);
    inputIds.push(inputSequence);
    attentionMasks.push(attnMask);
  }

  // Convert the input sequences and attention masks to TensorFlow tensors
  const inputTensors = tf.tensor2d(inputIds);
  const attnMaskTensors = tf.tensor2d(attentionMasks);

  // Return the preprocessed data as an object
  return { inputIds: inputTensors, attentionMasks: attnMaskTensors };
}
