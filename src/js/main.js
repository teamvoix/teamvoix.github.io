'use strict';

var cookies = require('cookies-js');
var language = cookies('lang') || navigator.language || navigator.userLanguage;

function changeLang (lang) {
  cookies('lang', lang);
  if (~lang.indexOf('ru') && window.location.pathname !== '/') {
    window.location.pathname = '/';
  } else if (~lang.indexOf('en') && !~window.location.pathname.indexOf('/en')) {
    window.location.pathname = '/en';
  }
}

window.onload = function() {
  var enSwitcher = document.querySelectorAll('.language-switcher.en');

  if (enSwitcher.length) {
    enSwitcher[0].onclick = function() {
      changeLang('en');
    };
  }

  var ruSwitcher = document.querySelectorAll('.language-switcher.ru');

  if (ruSwitcher.length) {
    ruSwitcher[0].onclick = function() {
      changeLang('ru');
    };
  }
};

changeLang(language);
