'use strict';

// index.html page to dist folder
import '!!file-loader?name=[name].[ext]!../favicon.ico';

// vendor files
import "./index.vendor";

// main App module
import "./index.module";

import "../assets/styles/sass/index.scss";

// akdemo specifics
import "../assets/styles/css/akng.css";


angular.element(document).ready(() => {
  angular.bootstrap(document, ['ngDemo'], {
    strictDi: true
  });
});
