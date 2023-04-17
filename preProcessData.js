// const fs = require('fs');
// const csv = require('csv-parser');
// const natural = require('natural');

// const tokenizer = new natural.WordTokenizer();
// const sentenceTokenizer = new natural.SentenceTokenizer();
// const stopWords = new Set(natural.stopwords);

// const stemmer = natural.PorterStemmer;
// const lemmatizer = new natural.Lemmatizer();
const fs = require('fs');
// const openai = require('openai');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const stopWords = require('stopwords').english;
const stemmer = natural.PorterStemmer;
const lemmatizer = natural.LancasterStemmer;
const csv = require('csv-parser');
const finalDataset = [];
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();
// Set up the OpenAI API client
const apiKey = process.env.OPENAI_API_KEY; // Replace with your API key
// const modelsApi = new openai.ModelsApi(apiKey);
const OpenAI = require('openai');
console.log('apiKey::::', apiKey);
const modelsApi = new OpenAI({ apiKey }).models;
fs.createReadStream('customer_support_dataset.csv')
  .pipe(csv())
  .on('data', (data) => {
    console.log('data.query:::', data.query);
    console.log('data.response:::', data.response);
    // Preprocess the query and response
    const query = preProcessData(data.query);
    const response = preProcessData(data.response);

    // Store the preprocessed query and response in the finalDataset array
    finalDataset.push({
      query,
      response,
    });
  })
  .on('end', () => {
    console.log('Preprocessed dataset:', finalDataset);

    // Fine-tune the GPT-3 model on the preprocessed dataset
    const prompt = 'Please provide customer support for the following queries and responses:\n';
    let trainingData = '';
    finalDataset.forEach((row) => {
      trainingData += `${row.query} ${row.response}\n`;
    });
    const fineTuneRequest = {
      "model": "text-davinci-002",
      "prompt": prompt,
      "temperature": 0.5,
      "max_tokens": 60,
      "n": 1,
      "stop": ["\n"],
      "examples": [
        trainingData
      ]
    };
    modelsApi.createFineTune(fineTuneRequest, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('fine tune data::', data);
      }
    });
    // Create a CSV writer instance and specify the output file path
    const csvWriter = createCsvWriter({
      path: 'pre_processed_dataset.csv',
      header: [
        { id: 'query', title: 'Query' },
        { id: 'response', title: 'Response' }
      ]
    });

    // Write the final dataset to the CSV file
    csvWriter.writeRecords(finalDataset).then(() => console.log('The final dataset has been written to the CSV file successfully.'));
  });

/**
 * Preprocesses the text by tokenizing, converting to lowercase,
 * removing punctuation marks and special characters, removing stop words,
 * and performing lemmatization.
 *
 * @param {string} text - The text to preprocess.
 * @returns {string} The preprocessed text.
 */
// function preProcessData(text) {
//   console.log('text::::', text);
//   // Tokenize the text into sentences
//   const sentences = sentenceTokenizer.tokenize(text);

//   // Tokenize each sentence into words
//   let words = [];
//   sentences.forEach((sentence) => {
//     words = words.concat(tokenizer.tokenize(sentence));
//   });

//   // Convert all the text to lowercase
//   words = words.map((word) => word.toLowerCase());

//   // Remove all punctuation marks and special characters
//   words = words.filter((word) => !/[^\w\s]/gi.test(word));

//   // Remove stop words (such as "the," "a," "an," "and," etc.) to reduce noise in the data
//   words = words.filter((word) => !stopWords.includes(word));

//   // Perform stemming to reduce words to their root form
//   words = words.map(word => stemmer.stem(word));
  
//   words = words.map(word => lemmatizer.stem(word));
//   // Join the preprocessed words back into a single string
//   return words.join(' ');
// }









// const fs = require('fs');
// const natural = require('natural');
// const tokenizer = new natural.WordTokenizer();
// const sentenceTokenizer = new natural.SentenceTokenizer();
// const stopWords = require('stopwords').english;
// const stemmer = natural.PorterStemmer;
// const lemmatizer = natural.LancasterStemmer;
// const csv = require('csv-parser');
// const text = fs.readFileSync('data.txt', 'utf-8');

function preProcessData(text) {
  const results = [];
  
  // Tokenize the text into sentences
  const sentences = sentenceTokenizer.tokenize(text);
  console.log('sentences::', sentences);

  // Tokenize each sentence into words
  let words = [];
  sentences.forEach(sentence => {
    words = words.concat(tokenizer.tokenize(sentence));
  });
  console.log('words:::::', words);

  // Convert all the text to lowercase
  words = words.map(word => word.toLowerCase());
  console.log(words);

  // Remove all punctuation marks and special characters
  words = words.filter(word => !/[^\w\s]/gi.test(word));
  console.log('punctuation::', words);

  // Remove stop words (such as "the," "a," "an," "and," etc.) to reduce noise in the data
  words = words.filter(word => !stopWords.includes(word));
  console.log('stop_words::', words);

  // Perform stemming or lemmatization to reduce words to their root form
//  words = words.map(word => stemmer.stem(word));
//   console.log('stemmed_words::', words);

//  words = words.map(word => lemmatizer.stem(word));
//   console.log('lemmatized_words::', words);
  return words.join(' ');
}
// preProcessData();
// // module.exports = { preProcessData };
