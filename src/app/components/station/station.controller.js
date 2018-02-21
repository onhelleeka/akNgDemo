'use strict';

export default class StationController {
    constructor($log) {
        'ngInject';
        //let $ctrl = this;
        this.$log = $log;
        //this.$log.log("ctrl: ", $ctrl); 
        this.getVal = function getVal(tag,unit) {
            return ( tag === 'MW') ? unit.attributes.MW : unit.attributes.LMP;
        };
    }

    $onInit() {
        //this.$log.log('Station component controller');       
    }

}