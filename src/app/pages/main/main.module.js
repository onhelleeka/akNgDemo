//'use strict';

import MainComponent from './main.component';

// akdemo specific modules
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-pageslide-directive/src/angular-pageslide-directive';
import 'angularjs-dropdown-multiselect/dist/src/angularjs-dropdown-multiselect';
import 'jquery/dist/jquery';
import 'angular-animate/angular-animate';
import '../../../../bower_components/bootstrap/dist/js/bootstrap';
import '../../../../bower_components/bootstrap/dist/css/bootstrap.css'; 
import '../../../../bower_components/angular-advanced-searchbox/dist/angular-advanced-searchbox-tpls';



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
