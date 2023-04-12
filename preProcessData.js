const fs = require('fs');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const stopWords = require('stopwords').english;
const stemmer = natural.PorterStemmer;
const lemmatizer = natural.LancasterStemmer;

const text = fs.readFileSync('data.txt', 'utf-8');

function preProcessData() {
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
  const stemmedWords = words.map(word => stemmer.stem(word));
  console.log('stemmed_words::', stemmedWords);

  const lemmatizedWords = words.map(word => lemmatizer.stem(word));
  console.log('lemmatized_words::', lemmatizedWords);
  return {
    sentences, words, stemmedWords,  lemmatizedWords
  }
}

module.exports = { preProcessData };
