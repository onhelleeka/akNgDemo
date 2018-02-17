//'use strict';

import MainComponent from './main.component';
import angular from 'angular';

// akdemo specific modules
import uiBootstrap from 'angular-ui-bootstrap';

import 'javascript-detect-element-resize/detect-element-resize';
import 'javascript-detect-element-resize/jquery.resize';
import 'angular-gridster/src/angular-gridster';
import 'angular-gridster/dist/angular-gridster.css';

import 'jquery/dist/jquery';
import '../../../../bower_components/bootstrap/dist/js/bootstrap';
import 'angular-animate/angular-animate.min';
import '../../../../bower_components/bootstrap/dist/css/bootstrap.css'; 
import '../../../../bower_components/angular-advanced-searchbox/dist/angular-advanced-searchbox-tpls';

import 'angularjs-dropdown-multiselect/dist/src/angularjs-dropdown-multiselect';
import 'angular-pageslide-directive/src/angular-pageslide-directive';

const mainPageModule = angular.module('main-module', [
    'ui.router',uiBootstrap, 'pageslide-directive','angularjs-dropdown-multiselect',
    'gridster','angular-advanced-searchbox'
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
