'use strict';

import StationComponent from './station.component';
import './station.scss';

const stationModule = angular.module('station-module', []);

stationModule
    .component('stationTable', new StationComponent() ); 

export default stationModule;
