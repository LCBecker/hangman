'use strict';

/**
* @ngdoc function
* @name catmanApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the catmanApp
*/
angular.module('hangmanApp')
.controller('MainCtrl', function ($scope, wordService) {

  $scope.word = null;
  $scope.hiddenWord = null;
  $scope.prevGuessList = null;
  $scope.body = null;
  $scope.winner = null;
  $scope.loser = null;
  $scope.alerts = [];
  $scope.stats = [{'name': 'Games Won', 'count': 0}, {'name': 'Games Lost', 'count': 0},
    {'name': 'Games Played', 'count': 0}];


  /*
  Randomly selects a letter. Used to pick word file.
  */
  $scope.getLetter = function() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var index = Math.floor(Math.random() * alphabet.length);
    return alphabet.substring(index, index + 1);
  };

  /*
    Randomly selects one word from an array of possible words.
  */
  $scope.startGame = function() {
    var words = '';
    var letter = $scope.getLetter();
    wordService.getWord(letter).then(function(data) {
      words = data.data;
      var wordArray = words.split('\n');
      var index = Math.floor(Math.random() * (wordArray.length));
      $scope.word = wordArray[index];
      $scope.setInitialGameValues();
    });
  };

  /*
    Sets up initial game values.
  */
  $scope.setInitialGameValues = function() {
    $scope.hiddenWord = '';
    $scope.prevGuessList = [];
    $scope.body = [false, false, false, false, false, false, false, false, false, false];
    $scope.winner = false;
    $scope.loser = false;
    angular.element(document.querySelector('#submit-guess')).prop('disabled', false);
    for (var i = 0; i < $scope.word.length; i++) {
      $scope.hiddenWord = $scope.hiddenWord.concat('_ ');
    }
  };

  $scope.startGame();

  /*
    Determines whether guess is a letter and not a previous guess.
  */
  $scope.isValidGuess = function(guess) {
    if (!guess.match(/^[a-z]$/)) {
      $scope.alerts.push({type: 'danger', msg: 'Guesses can only be letters. Please try again.'});
      return false;
    }

    if ($scope.prevGuessList.indexOf(guess) > -1) {
      $scope.alerts.push({type: 'danger', msg: 'You already guessed the letter ' + guess + '. Please try again.'});
      return false;
    }
    return true;
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  /* Determines if the guess is part of the word. */
  $scope.evalGuess = function(guess) {
    angular.element(document.querySelector('#input-guess')).val(''); // Clears input field.
    guess = guess.toLowerCase();
    if ($scope.isValidGuess(guess)) {
      $scope.prevGuessList.push(guess);
      var indices = []; // holds all indices where guess appears in word.
      for (var i = 0; i < $scope.word.length; i++) {
        if ($scope.word[i] === guess) {
          indices.push(i);
        }
      }
      if (indices.length === 0) { // Guess was not a letter in the word.
        $scope.showMan();
      } else { // Guess was a letter in the word.
        $scope.showLetters(guess, indices);
      }
      $scope.isEndOfGame();
    }
  };


  /* Display a part of the catman. */
  $scope.showMan = function() {
    var i = 0;
    while (i < 10) {
      if (!$scope.body[i]) {
        $scope.body[i] = true;
        break;
      }
      i++;
    }
  };

  /* Replaces the dashes in hidden word with correctly guesses letters. */
  $scope.showLetters = function(guess, indices) {
    var removedSpaces = $scope.hiddenWord.replace(/\s/g, '');
    var splitWord = removedSpaces.split('');
    for (var i in indices) {
      splitWord[indices[i]] = guess;
    }
    $scope.hiddenWord = splitWord.join(' ');
  };

  /* Determines if all body parts are revealed */
  $scope.isBodyRevealed = function() {
    var revealed = true;
    for (var i in $scope.body) {
      if ($scope.body[i] === false) {
        revealed = false;
        break;
      }
    }
    return revealed;
  };

  /*
  Determines whether game is over
  */
  $scope.isEndOfGame = function() {
    var hiddenWord = $scope.hiddenWord.replace(/\s/g, '');
    if ($scope.word === hiddenWord) {
      $scope.winner = true;
      $scope.stats[0].count++;
      $scope.stats[2].count++;
      angular.element(document.querySelector('#submit-guess')).prop('disabled', true);
    }

    if($scope.isBodyRevealed()) {
      $scope.loser = true;
      $scope.stats[1].count++;
      $scope.stats[2].count++;
      $scope.hiddenWord = $scope.word;
      angular.element(document.querySelector('#submit-guess')).prop('disabled', true);
    }
  };
});
