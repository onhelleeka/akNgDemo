'use strict';

export default class StationController {
    constructor($log) {
        'ngInject';
        let $ctrl = this;
        this.$log = $log;
        this.$log.log("ctrl: ", $ctrl); 
    }

    $onInit() {
        this.$log.log('Station component controller');       
    }

}