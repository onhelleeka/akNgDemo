'use strict';

export default class FooterController {
    constructor($log) {
        'ngInject';
        this.$log = $log;
    }

    $onInit() {
        this.$log.log("Main and Station components - Angelica Kelley (OnHellEeka)");
        this.$log.log("Scaffolding - Yeoman");
    }
}