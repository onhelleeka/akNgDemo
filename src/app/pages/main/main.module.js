//'use strict';

import MainComponent from './main.component';

// akdemo specific modules
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-pageslide-directive/src/angular-pageslide-directive';

import 'jquery/dist/jquery';
import 'bootstrap/dist/js/bootstrap';
import 'angular-animate/angular-animate.min';
import 'bootstrap/dist/css/bootstrap.css'; 
import 'angular-advanced-searchbox/dist/angular-advanced-searchbox-tpls';

import 'angularjs-dropdown-multiselect/dist/src/angularjs-dropdown-multiselect';

const mainPageModule = angular.module('main-module', [
    'ui.router',uiBootstrap, 'pageslide-directive','angularjs-dropdown-multiselect',
    'angular-advanced-searchbox'
])
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url: '/',
                component: 'main'
            });
    })
    .component('main', new MainComponent());

export default mainPageModule;
