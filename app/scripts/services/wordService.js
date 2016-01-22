'use strict';

var hangman = angular.module('hangmanApp');

/*
  Reads in a file of words.
*/
hangman.factory('wordService', function($http) {
  return {
    getWord: function(letter) {
      var wordRequest = {
        method: 'GET',
        url: 'words/' + letter + ' Words.txt'
      };
      return $http(wordRequest);
    }
  };
});
