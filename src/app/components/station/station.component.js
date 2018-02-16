'use strict';

import stationTpl from './station.html';
import StationController from './station.controller';

export default class StationComponent {
    constructor() {
        this.bindings = {
            "db": "<",
            "station": "<",
            "tag": "@",
            "bgclass": "@" };  
        this.templateUrl = stationTpl;
        this.controller = StationController;
        
    }
}