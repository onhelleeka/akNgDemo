'use strict';

import footerModule from './components/footer/footer.module';
import stationModule from './components/station/station.module';

export default angular.module('index.components', [
	footerModule.name,
	stationModule.name
]);
