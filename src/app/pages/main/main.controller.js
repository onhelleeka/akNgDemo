'use strict';


import  _ from 'lodash/core';

import moment from 'moment';

import angularLogo from '_images/angular.png';

export default class MainController {
   
    constructor($log,$rootScope, $scope, $window, $state, $parse, $stateParams, $uibModal, $filter, $timeout) {       
        'ngInject';
        this.$log = $log;
        
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$parse = $parse;
        this.$stateParams = $stateParams;
        this.baseURL = 'bogusURL';
        this.afDatabase = 'bogusdb';
        this.rootPath = '\\\\bogusserver\\bogusdb';
        this.window = $window;
        this.$filter = $filter;
        this.$timeout = $timeout;
    
        this.wzGrpsReady= false;
        this.notready = true;
        this.optionsOpened = false;
        this.searchOpened = false;
        this.filtersOpened = false;
    
        this.availableSearchParams = [
            { key: "station", name: "Station", placeholder: "Station..." },
            { key: "unit", name: "Unit", placeholder: "Unit..." },
            { key: "fuel", name: "Fuel", placeholder: "Fuel..." },
            { key: "weatherzone", name: "WeatherZone", placeholder: "WeatherZone..." },
            { key: "status", name: "Status", placeholder: "Status..." }
        ];
        this.searchParams = {};
        this.searchParamsSelected = {};
    
        this.startupdefault = 'wzgroup';
        this.displayMode = '';
        this.displayModeSelected = '';
        this.displayGroupMode = this.startupdefault;
        this.displayGroupModeSelected = this.startupdefault;
        this.displayValueType = 'MW';
        this.displayValueTypeSelected = 'MW';
        this.displayColorScheme = 'unitscheme';
        this.displayColorSchemeSelected = 'unitscheme';
        this.displayAttrFilters = {};
        this.displayAttrFiltersSelected = {}; //this.displayAttrFilters;???
        this.lastUpdatedFilters = new Date(new Date().getTime() - 86400000);
        this.lastLoggedToConsole = new Date();
        this.currentTrimmedUnits = {};
    
        this.currentModeSelected = '';
        this.currentGroupModeSelected = this.startupdefault;
        this.currentValueTypeSelected = 'MW';
        this.currentColorSchemeSelected = 'unitscheme';
        this.srch = '';
    
        this.openChildren = {};
        this.stnTotals = {};
        this.displayedCount = 0;
        this.allUnits = {};
        this.resourceList = {};
    
        this.unitList = [];
    
        this.displayRSTFiltersSelected = [];
        this.getRSTs = function getRSTs() {
            this.RSTON = ['ON','STARTUP','SHUTDOWN','FRRSUP','ONREG','ONRUC','ONDSR','ONOS','ONOSREG','ONDSRREG','ONTEST','ONEMR','ONRR','ONOUTPUT'];
            this.RSTOFF = ['OFF','EMR','OUT','OFFNS','OFFQS'];
            this.RSTs = this.RSTON.concat(this.RSTOFF);
    
            this.rstSelectList = [];
            this.displayRSTFilters = [];
            this.displayRSTFiltersSelected = [];
    
            for (let i = 0; i < this.RSTs.length; i++) {
                let k = this.RSTs[i];
                let grp = (this.RSTON.includes(k)) ? 'ONLINE' : 'OFFLINE';
                this.rstSelectList.push({ label: k, id: k, rstgrp: grp});
            }
    
            this.rstSelectSettings = { keyboardControls: true, enableSearch: true,
                                    showSelectAll: true, selectedToTop: true ,
                                scrollableHeight: '500px', scrollable: true, buttonClasses: 'optiondd btn btn-default btn-sm',
                                selectByGroups: ['ONLINE', 'OFFLINE'], groupByTextProvider: function(groupValue) { switch (groupValue)
                            { case 'ONLINE': return 'ONLINE'; case 'OFFLINE': return 'OFFLINE'; case 'O': return 'Other'; } }, groupBy: 'rstgrp',  };
            this.rstTextSettings = { buttonDefaultText: 'Resource Status', dynamicButtonTextSuffix: '/' + this.rstSelectList.length + ' Resource Statuses' };
    
        };
    
       
        this.displayWZFiltersSelected = [];
        this.gridsterRowHeight = 17;
    
        this.weatherZoneSettings = {    
            WEST:          { name: 'WEST', cnt: 0,  max: 10, cols: '1', sizeX: 1, sizeY: 61, defaultY: 61, defaultRow: 0, row: 0, col: 0 }, 
            EAST:          { name: 'EAST', cnt: 0, max: 10, cols: '1', sizeX: 1, sizeY: 61, defaultY: 61, defaultRow: 0, row: 0, col: 12 },
            NORTH:         { name: 'NORTH', cnt: 0, max: 20, cols: '11', sizeX: 11, sizeY: 12, defaultY: 12, defaultRow: 0, row: 0, col: 1 },                                                                     
            CENTRAL: { name: 'CENTRAL', cnt: 0, max: 20, cols: '11', sizeX: 11, sizeY: 12,defaultY: 12, defaultRow: 12, row: 12, col: 1  },
            SOUTH: { name: 'SOUTH', cnt: 0, max: 1000, cols: '11', sizeX: 11, sizeY: 12,defaultY: 12, defaultRow: 24, row: 24, col: 1  }, 
        };
    
        this.setWZSelections = function setWZSelections() {
            this.wzSelectList = [];
            let list = Object.keys(this.weatherZoneSettings);
            for (let i = 0; i < list.length; i++) {
                this.wzSelectList.push({ label: list[i], id: list[i]});
            }
            this.wzSelectSettings = { keyboardControls: true, enableSearch: true,
                                        showSelectAll: true, selectedToTop: true,
                                        buttonClasses: 'optiondd btn btn-default btn-sm'
                                    };
            this.wzTextSettings = { buttonDefaultText: 'Weather Zones', dynamicButtonTextSuffix: '/' + this.wzSelectList.length + ' Weather Zones' };
    
        };
    
        this.getWZs = function getWZs() {
    
            // Need WZs in this order
            this.weatherZonesOrder =   Object.values(this.weatherZoneSettings);
            this.weatherZoneStyles = {};
            this.displayWZFilters = [];
            this.displayWZFiltersSelected = [];
            this.legendWeatherZones = [];
            this.wzMWGrp = {};
            this.wzTotals = {};
            this.zones = {};
    
            let devFlag = true;//this.devmode; 
            this.wzgridsterSettings = { columns: 20, colWidth: 100, 
                                        rowHeight: this.gridsterRowHeight, floating: false, 
                                        pushing: devFlag, swapping: devFlag, 
                                        margins: [0, 0], outerMargin: false,
                                        draggable: { enabled: devFlag},
                                        resizable: { enabled: devFlag, 
                                            handles: ['n', 'e', 's', 'w', 'se', 'sw']} 
                                        };
    
            for (let i = 0; i < this.weatherZonesOrder.length; i++) {
    
                let k = this.weatherZonesOrder[i].name;
                this.$log.log("console - ",k," cnt: ", this.weatherZonesOrder.length);
                let cols = (this.checkIE() === true) ? 'auto' : this.weatherZoneSettings[k].cols;
    
                this.weatherZoneStyles[k] = { 'color': 'black',
                                              'column-count': cols , 
                                              '-moz-column-count': cols, 
                                              '-webkit-column-count': cols }; 
    
                this.legendWeatherZones.push({ type: k, classname: k.toLowerCase() });
                this.wzTotals[k] = 0;
    
                let displayName = this.toCamelCase(k.replace('_',' ').toLowerCase());
                let classname = '.' + k.toLowerCase();
                let bgcolor = this.getStyleRuleValue('background-color',classname);
                let color = this.getStyleRuleValue('color',classname);
                let allstyle = { 'background-color': bgcolor, 'color': color};
                let srchtag = k; 
                let wzGrid = { gsclass: classname.replace('.','') + '_gridster' };
                    
                this.zones[k] = {   stations: [],
                                    wzName: k, displayName: displayName,
                                    type: k, options: wzGrid,
                                    srchtag: srchtag, allstyle: allstyle, color: bgcolor,
                                    classname: classname.replace('.','') };
                this.$log.log("console - wz settings: ", this.zones[k]);
                           
            }
    
        };
    
        
        this.setWZDefaults = function setWZDefaults () {
            this.displayWZFilters = this.wzSelectList.slice();
            this.displayWZFiltersSelected = this.wzSelectList.slice();
            this.wzTotals = {};
            for (let k in this.weatherZonesOrder) { this.wzTotals[this.weatherZonesOrder[k].name] = 0 }
        };
    
        this.saveOnOpenOptions = function saveOnOpenOptions () {
    
            if (this.optionsOpened === false ) { 
                this.optionsOpened = true 
                this.filtersOpened = true;
            }
    
            this.currentModeSelected = this.displayModeSelected;
            this.currentGroupModeSelected = this.displayGroupModeSelected;
            this.currentValueTypeSelected = this.displayValueTypeSelected;
            this.currentColorSchemeSelected = this.displayColorSchemeSelected;
            this.currentAttrFiltersSelected = this.cloneObj(this.displayAttrFiltersSelected);
            this.currentWZFiltersSelected = this.displayWZFiltersSelected.slice();
            this.currentRSTFiltersSelected = this.displayRSTFiltersSelected.slice();
    
        };
    
        this.registeredObjects = [];
        this.showSearchBox = false;
    
        this.$rootScope.hideSearch = () => {
            this.showSearchBox = false;
        };
    
        this.$rootScope.showSearch = () => {
            this.$log.log("showing searchbox ");
            this.showSearchBox = true;
        };
    
        this.toggleSearch = function toggleSearch(idname) {
    

            if (this.searchOpened === false ) { 
                this.searchOpened = true;
                this.filtersOpened = true;
                this.$log.log("Toggle ", idname); //make things happy
            }
    
            //let id = document.getElementById(idname);
            if (this.showSearchBox === false) { this.$rootScope.showSearch() }
            else { this.$rootScope.hideSearch() }
        };
    
        this.$rootScope.openModal = (options, data) => {
    
            this.modalInstance = $uibModal.open(angular.merge({}, {
                resolve: {
                resData: () => data,
                },
                controller(resData) {
                'ngInject';
    
                this.data = resData;
                },
                controllerAs: '$modal',
            }, options)).result.catch(() => {});
    
        };
    
        this.$rootScope.setSearchParameters = () => {
            if ( this.searchParams.query ) {
                this.updateUnitList(this.searchParams.query); 
                this.srch = this.searchParams.query;
            } 
            
            this.searchParams = this.searchParamsSelected;
            
        };
    
        this.$rootScope.clearFilters = () => {
            document.getElementById('srchquery').value = "";
            this.searchParams = {};
            this.searchParamsSelected = {};
            this.srch = ''; 
            this.filteredUnitList = this.unitList;
        };
    
        this.$rootScope.setEnteredInputText = (e, data) => {
    
            let keycode = e.keyCode || e.which;
    
            if(keycode === '13' || keycode === '8') {
                if (data.searchQuery !== undefined) { 
                    this.srch = data.searchQuery;
                    this.searchParams.query = data.searchQuery;
                    this.updateUnitList(this.searchParams.query);
                } else {
                    if (data.searchParam.key === 'station') { this.searchParams['station'] = data.searchParam.value }
                    else if (data.searchParam.key === 'unit') { this.searchParams['unit'] = data.searchParam.value }
                    else if (data.searchParam.key === 'fuel') { this.searchParams['fuel'] = data.searchParam.value }
                    else if (data.searchParam.key === 'weatherzone') { this.searchParams['weatherzone'] = data.searchParam.value }
                    else if (data.searchParam.key === 'status') { this.searchParams['status'] = data.searchParam.value }
                }
                this.lastUpdatedFilters = new Date();
            }
        };
    
        this.$rootScope.clearEnteredInputText = (e, data) => {
            if (data.searchParam.key === 'station') { delete this.searchParams['station'] }
            else if (data.searchParam.key === 'unit') { delete this.searchParams['unit'] }
            else if (data.searchParam.key === 'fuel') { delete this.searchParams['fuel'] }
            else if (data.searchParam.key === 'weatherzone') { delete this.searchParams['weatherzone'] }
            else if (data.searchParam.key === 'status') { delete this.searchParams['status'] }
        };
    
        this.toggled = false;
        this.checked = false;
        this.initialOpen = true;
        this.size = '100px';
    
        this.addScroll = function addScroll() {
            let windowHeight = Number(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
            return (windowHeight < 600) ? true : false;
        };
    
        this.hideScrollX = function hideScrollX() {
            return (this.windowWidth >= 1920 && this.displayGroupModeSelected === 'wzgroup') ? true : false;
        };
    
        this.onOptionsClose = () => {
            this.lastUpdatedFilters = new Date();
            if ( !this.toggled) { this.cancelOptions() }
        };
    
        this.onOptionsOpen = () => {
            this.toggled = false;
        };
    
        this.onSelectedChangedToggle = () => {
            this.displayAttrFilters['None'] = (this.isDisplayFiltered()) ? false : true ;
        };
    
    
        this.toggle = function toggle() {
                this.toggled = true;
                this.checked = !this.checked
                if (this.checked === true) {
                    this.saveOnOpenOptions();
                }
        };
    
        this.getStyleRuleValue =  function getStyleRuleValue(style, selector) {
            for (let i = 0; i < document.styleSheets.length; i++) {
                let mysheet = document.styleSheets[i];
                let myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
                for (let j = 0; j < myrules.length; j++) {
                    if (myrules[j].selectorText && myrules[j].selectorText.toLowerCase() === selector) {
                        return myrules[j].style[style];
                    }
                }
            }
        };
    
        this.isInList = function isInList(str,list) {
    
            let inList = false;
            if (angular.isArray(list)) {
                if (list.includes(str)) { inList = true }
                else if (angular.isObject(list[0])) {
                    let tmpAry = [];
                    for (let j = 0; j < list.length; j++) {
                        tmpAry.push(list[j].id);
                    }
                    inList = tmpAry.includes(str);
                } else { inList = false }
    
            } else {
                inList = Object.keys(list).includes(str) || Object.values(list).includes(str);
            }
            return inList;
        };
    
        this.realTimeTypes = { 'HydroGeneratingUnit': { type: 'Hydro', classname: 'hydro' },
                               'SolarGeneratingUnit': { type: 'Solar', classname: 'solar' },
                               'WindGeneratingUnit': { type: 'Wind', classname: 'wind' },
                               'NuclearGeneratingUnit': { type: 'Nuclear', classname: 'nuclear' },
                               'ThermalGeneratingUnit': { type: 'Thermal', classname: 'defaultunit' },
                               'CombinedCyclePlant': { type: 'CC', classname: 'none' },
                               'RTVOther': { type: 'RTVOther', classname: 'none'},
                               'Startup': { type: 'Startup', classname: 'startup' },
                               'Shutdown': { type: 'Shutdown', classname: 'shutdown' },
                               'Coal': { type: 'Coal', classname: 'coal'} };
    
    
        this.coalTypes = [ 'Bituminous Coal', 'Lignite', 'Subbituminous Coal' ];
    
        this.attrOrder =     [{ name: 'None', srchtag: ''},
                              /*{ name: 'Blackstart', srchtagname: 'tagBlackstart', srchtag: 'IsBlackstart' },*/
                              { name: 'Quickstart Qualified', srchtagname: 'tagQuickstart', srchtag: 'IsQuickstart' }
                             ];
    
        this.lmpOrder =   [{ name: 'LMP N/A', classname: 'lmp16'},
                           { name: '> $2000', classname: 'lmp15' },
                           { name: '$1000 - $2000', classname: 'lmp14' },
                           { name: '$500 - $1000', classname: 'lmp13' },
                           { name: '$100 - $500', classname: 'lmp12' },
                           { name: '$50 - $100', classname: 'lmp11' },
                           { name: '$25 - $50', classname: 'lmp10' },
                           { name: '$10 - $25', classname: 'lmp09' },
                           { name: '$0 - $10', classname: 'lmp08' },
                           { name: '-$10 - $0', classname: 'lmp07' },
                           { name: '-$25 - -$10', classname: 'lmp06' },
                           { name: '-$50 - -$25', classname: 'lmp05' },
                           { name: '-$100 - -$50', classname: 'lmp04' },
                           { name: '-$500 - -$100', classname: 'lmp03' },
                           { name: '-$1000 - -$500', classname: 'lmp02' },
                           { name: '< -$1000', classname: 'lmp01' }];
    
        this.setGroupDefaults = function setGroupDefaults() {
            this.displayGroupMode = this.startupdefault;
            this.displayGroupModeSelected = this.startupdefault;
        };
    
        this.setRSTDefaults = function setRSTDefaults () {
            this.displayRSTFilters = this.rstSelectList.slice();
            this.displayRSTFiltersSelected = this.rstSelectList.slice();
        };
    
        this.setAttrDefaults = function setAttrDefaults () {
            this.displayAttrFilters = {};
            this.displayAttrFiltersSelected = {};
            for (let i = 0; i < this.attrOrder.length; i++) {
                let k = this.attrOrder[i].name;
                this.displayAttrFilters[k] = (k === 'None') ? true : false;
                this.displayAttrFiltersSelected[k] = (k === 'None') ? true : false;
            }
        };
    
        this.cloneObj = function cloneObj (obj) {
            let newObj = {};
            for (let k in obj) {
                newObj[k] = obj[k];
            }
            return newObj;
        };
    
        this.toggleAttrFilters = function toggleAttrFilters (selected) {
    
            if (selected === 'None') {
                this.setAttrDefaults();
                this.displayRSTFilters = this.rstSelectList.slice();
                this.displayWZFilters = this.wzSelectList.slice();
            }
            else {
                this.displayAttrFilters['None'] = (this.isDisplayFiltered()) ? false : true;
            }
        };
    
            
        this.toggleChildren = function toggleChildren(id,wz,resetFlg) {
    
            let panel = document.getElementById(id); 
            let dd = document.getElementById("accordiondd" + id);
            let sizeY = (wz === 'NONE') ? 0 : Number(this.weatherZoneSettings[wz].sizeY) - 1; //omit heading row
            let sizeYHeight =  sizeY * this.gridsterRowHeight;
            let wzid =  wz + 'gridster';
            let wzHeight;
            let newsize;
    
            if (panel.style.display === "block") {
    
                panel.style.display = "none";
                dd.className = "accordiondd"; 
                delete this.openChildren[id];
    
                if ( this.displayGroupModeSelected === 'wzgroup' && resetFlg === false) {
                    this.trimWZLayout(wz,resetFlg);
                }
    
            } else {  
    
                dd.className = "accordionddopen"; 
                panel.style.display = "block"; 
                this.openChildren[id] = wz;
                
                if ( this.displayGroupModeSelected === 'wzgroup') {
                    wzHeight = document.getElementById(wzid).offsetHeight;
    
                    if (wzHeight > sizeYHeight) {   
                        newsize = Math.ceil(wzHeight / this.gridsterRowHeight) + 1; // add heading row           
                        this.weatherZoneSettings[wz].sizeY = newsize;
                    }
                }
            }
    
        };
    
        this.getCategory = function getCategory(categoryList) {
    
            let genType = this.realTimeTypes['Other'];
    
            angular.forEach(this.realTimeTypes, function (v, k) {
                if (categoryList.indexOf(k) > -1) {
                    genType = v;
                }
            });
    
            return genType;
        };
                    
        this.isInUnitList = function isInUnitList (path,units) {
    
            let match = [];
            for (let i = 0; i < units.length; i++) {
                if (units[i].Path === path) { match.push(true) }
                else { match.push(false) }
            }
            return match.includes(true);
        };
    
        this.getDCTies = function getDCTies() {
    
            this.dctieUnits = {};
    
            let result = [];
    
            for (let i = 0; i < result.length; i++) {
                    let tmpArray = result[i].Path.split('DCTies\\');
                    let dctie = tmpArray[1].split('\\')[0];
                    let attrs = this.getAttributes(result[i].Path,'',['Flow'],false);
                    this.dctieUnits[dctie] = { attributes: attrs };
            }  
            
            this.getAllAttributes();       
        };

        this.getRandomWZ = function getRandomWZ () {
            let zones = Object.keys(this.weatherZoneSettings);
            let rwz = zones[this.getRandom(0,4)];
            //this.$log.log("rwz: ", rwz);
            if ( this.weatherZoneSettings[rwz].cnt < this.weatherZoneSettings[rwz].max ) {
                this.weatherZoneSettings[rwz].cnt++;
            } else {
                for (let i = 0; i < zones.length; i++) {
                    rwz = zones[i];
                    if ( this.weatherZoneSettings[rwz].cnt < this.weatherZoneSettings[rwz].max ) {
                        this.weatherZoneSettings[rwz].cnt++;
                        break;
                    }
                }
            }
            this.$log.log("console - WZ selected: ", rwz);
            return rwz;
        };

        this.createMockData = function createMockData () {
            let result = [];
            //this.$log.log("random num: ",this.getRandom(1,5));
            for (let i = 1; i <= 100; i++) {
                let stnName = 'Station' + i;
                let stnChildren = [];
                let stnZone = this.getRandomWZ();
                let catKeys = Object.keys(this.realTimeTypes);
                for(let c = 1; c <= this.getRandom(1,5); c++){
                    let unitName = 'Unit' + c;
                    stnChildren.push({ TemplateName: 'None', CategoryNames: [catKeys[this.getRandom(0,4)]],
                                       Name: unitName, Path: stnName + '/' + unitName,
                                       ExtendedProperties: { WeatherZone: {Value: stnZone } } 
                                     });
                }
                let stn = { Name: stnName, 
                            Children: stnChildren,
                            Path: this.afDatabase + '\\' + stnName
                        };
                result.push(stn);
            }
            this.$log.log("console - mock data: ", result); 
            return result;
        };

        this.getRandom = function getRandom (minimum,maximum) {
            return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        };

    
        this.getAllUnits = function getAllUnits () {
    
            this.unitList = [];
            this.substationList = {};
            this.parentUnits = {};
            this.childUnits = {};
    
            let result = this.createMockData();  

            
                for (let i = 0; i < result.length; i++) {
    
                        let stnObj = result[i];
                        let stn = stnObj.Name;
                        this.batchCallCount++;
    
                        //if (stn === 'BR') { this.$log.log(stnObj)};
    
                        for (let k = 0; k < stnObj.Children.length; k++) {
                            
                            let unit = stnObj.Children[k];
                            let dctieFlg = (unit.TemplateName.indexOf('DC Tie Unit') > -1) ? true : false;
                            let wz = unit.ExtendedProperties.WeatherZone.Value.replace('WZ_','');
    
                            if (unit.Children) {
                                //JOU or CC
                                let parentType = (unit.TemplateName.indexOf('JOU') > -1) ? 'JOU' :  'CC';
                                let children = unit.Children;
                                let parentPath = unit.Path;
    
                                this.parentUnits[parentPath] = { childUnits: [], weatherZone: wz, parentType: parentType };
    
                                let p = { Path: parentPath, HasChildren: true, Name: unit.Name, CategoryNames: unit.CategoryNames, weatherZone: wz,
                                            parentType: parentType, station: stn, isDCTie: dctieFlg, isChild: false };                    
                                this.initUnit(p); 
                                for (let j = 0; j < children.length; j++) {                                
                                    let unitChild = children[j];
                                    this.childUnits[unitChild.Path] = parentPath;
                                    let c = { Path: unitChild.Path, Name: unitChild.Name, CategoryNames: unitChild.CategoryNames, weatherZone: wz,
                                        parentPath: parentPath, isChild: true, childType: parentType, station: stn, isDCTie: dctieFlg };
                                    this.initUnit(c); 
                                }
                                
    
                            } else {
                                let c = { Path: unit.Path, Name: unit.Name, CategoryNames: unit.CategoryNames, weatherZone: wz,
                                        HasChildren: false, station: stn, isDCTie: dctieFlg, isChild: false };
                                this.initUnit(c); 
                            }
    
                        }
    
                }  
                
                this.unitList = Object.values(this.substationList);     
                //this.$log.log("console mock data: ",this.unitList);       
                this.hideLoading = true;
                this.getLegendUnits();
                this.setWZDefaults();                   
                this.currentWZFiltersSelected = this.wzSelectList.slice();            
                this.getDCTies();
    
        };
    
        this.initUnit = function initUnit(resObj) {
    
                        let stn = resObj.station;                  
                        let childflg = (resObj.isChild) ? true : false;
                        let aggWZ = (childflg) ? false : true;
                                       
                        let unitObj = this.createAttrObj(resObj, stn, aggWZ, childflg);                
    
                        if ( childflg ) {
                            this.parentUnits[resObj.parentPath].childUnits.push(unitObj);  
                        } else {                                                
    
                            if (stn in this.substationList) {
                                this.substationList[stn].units.push(unitObj);
                            }
                            else {
                                    
                                this.substationList[stn] = { stationName: stn,
                                                             category: 'Thermal',
                                                             units: [unitObj], 
                                                             weatherZone: resObj.weatherZone, 
                                                             lastStationFilterStatus: true,
                                                             lastUnitUpdated: new Date(),
                                                        }; 
                                this.stnTotals[stn] = 0;  
                               
                            } 
    
                        }
    
        };
    
        this.createAttrObj = function createAttrObj(resObj, stn, aggWZ, childflg) {
    
            // get streams after initial load
            let attrFilters = (childflg) ? this.getAttributes(resObj.Path,stn,['MW','RST','LMP'],false) : { LMP: 0, MW: 0, RST: "ON"};
            let staticAttrs = (childflg) ? this.getAttributes(resObj.Path,stn,['IsBlackstart','PANType','FuelType','QuickstartLookup'],true) : { IsBlackstart: false, PANType: "", FuelType: "", QuickstartLookup: false};
            let dctieAttrs = (resObj.isDCTie) ? { DCTieAttrs: { attributes: { Flow: 0 } }, DCTieName: "DCTie Unit" } : {};
            
            let unitObj = { stationName: stn,
                            Name: resObj.Name,
                            category: resObj.CategoryNames, 
                            attributes: attrFilters, 
                            dctie: dctieAttrs,
                            properties: staticAttrs, 
                            Path: resObj.Path,
                            HasChildren: resObj.HasChildren,
                            isDCTie: resObj.isDCTie,
                            isChild: resObj.isChild,
                            weatherZone: resObj.weatherZone,
                            aggregateWZ: aggWZ,
                          };
            this.allUnits[resObj.Path] = 'Object Created'; 
            this.resourceList['unit' + stn + resObj.Name] = { namelength: 0, 
                                                              lastFilterMatchStatus: true,
                                                            };
    
            return unitObj;
        };
    
        this.getAllAttributes = function getAllAttributes() {
    
            this.weatherZonePaths = {};
    
    
            for (let s = 0; s < this.unitList.length; s++) { 
                let stnObj = this.unitList[s];
                this.zones[stnObj.weatherZone].stations.push(this.substationList[stnObj.stationName]);
    
                let sUnits = stnObj.units;
                let newArray = [];
                for (let k = 0; k < sUnits.length; k++) { 
    
                    let skipFlag = (sUnits[k].isChild === false && (sUnits[k].Path in this.childUnits)) ? true : false;
                    
                    if (!skipFlag) {
    
                        let u = sUnits[k];
                        let cat = this.getCategory(u.category);
                        let attrFilters = this.getAttributes(u.Path,u.stationName,['MW','RST','LMP'])
                        let staticAttrs = this.getAttributes(u.Path,u.stationName,['IsBlackstart','PANType','FuelType','QuickstartLookup']);
                        let dctieAttrs = (u.isDCTie) ?  this.getAttributes(u.Path,u.stationName,['DCTieName']) : {};
                       
                        u.attributes = attrFilters;
                        u.properties = staticAttrs;
                        u.dctie = dctieAttrs;
                        u.category = cat;
                        newArray.push(u);
        
                    }  
                }
                this.unitList[s].units = newArray;
                this.substationList[stnObj.stationName].units = newArray;
                if ( s === this.unitList.length - 1 ) { 
                    this.notready = false;
                }  
               
            }
    
    
    
        };
    
        this.getAttributes = function getAttributes(path,stn,flds) {
    
            let attrData = {};
            
            for (let i = 0; i < flds.length; i++) {
                    
                    attrData[flds[i]] = (this.isInList(flds[i],['MW','LMP'])) ? this.getRandom(0,300) : flds[i];
                    if (flds[i] === 'Blackstart' || flds[i] === 'Quickstart') {
                        attrData['tagBlackstart'] = "IsBlackstart";
                        attrData['tagQuickstart'] = "IsQuickstart";
                    }
            }

           return attrData;
        };
    
      this.modalChartOptions = {
          legend: {
            enabled: true,
          },
          rangeSelector: {
            enabled: false,
          },
          scrollbar: {
            enabled: false,
          },
          plotOptions: {
            series: {
              step: true,
              tooltip: {
                valueDecimals: 1,
              },
            },
          },
          navigator: {
            enabled: false,
          },
          tooltip: {
            valueDecimals: 1,
          },
          xAxis: { ordinal: false },
      };
    
       this.seriesOptions = [
          { name: 'MW' },
          { name: 'LSL' },
          { name: 'LASL' },
          { name: 'HASL' },
          { name: 'HSL'},
          { name: 'BP'},
          { name: 'Flow'}
        ];
    
        /* this.$scope.$on('$destroy', () => {
            angular.forEach(this.registeredObjects, (o) => {
                this.$log.log("deregister",o);
            });
        }); */
    
        this.setColumns = function setColumns() {
    
            let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            let cols = Math.trunc(Number(w) / 101); //110
    
            Object.assign(document.getElementById('all').style, {
                        '-webkit-column-count': cols,
                        '-moz-column-count': cols,
                        'column-count': cols,
                        '-webkit-column-gap': '1px',
                        '-moz-column-gap': '1px',
                        'column-gap': '1px',
                    });
    
            return { '-webkit-column-count': cols,
                        '-moz-column-count': cols,
                             'column-count': cols,
                     '-webkit-column-gap': '1px',
                        '-moz-column-gap': '1px',
                             'column-gap': '1px', };
        };
    
        this.fmtNum = function fmtNum(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    
        this.getVal = function getVal(val,trim) {
            
            let rtnVal;
            if (angular.isNumber(val)) {
                rtnVal = ( val < 1 ) ? 0 : Math.trunc(val);
            }
            else {
                rtnVal = (val !== undefined && trim && val.indexOf("(") > -1) ? val.split("(")[0] : val;
            }
            return (rtnVal === undefined) ? '--' : this.fmtNum(rtnVal);
    
        };
    
        this.getDCTieVal = function getDCTieVal (val) {
            let rtnVal = this.fmtNum(Math.abs(Math.trunc(val)));
            if (rtnVal < 1) { rtnVal = 0 } 
            else {
                rtnVal = (val > 0 ) ? '(imp) ' + rtnVal : '(exp) ' + rtnVal ;
            }
            return rtnVal;
    
    
        };
    
        this.getPrice = function getPrice(val) {
    
            let rtnVal;
            if (val === undefined) {
                rtnVal = '--'; }
            else {
    
                rtnVal = (val > 999 || val < -99) ? this.fmtNum(Math.trunc(val)) : this.fmtNum(val.toFixed(2));
                rtnVal = (val < 0) ? rtnVal.replace('-','-$') : '$' + rtnVal;
            }
            return rtnVal;
        };
    
        this.checkIE = function checkIE() {
            let isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
            return isIE;
        };
    
        this.devmode = ( this.checkIE() === false ) ? true : false;
    
        this.getLegendUnits = function getLegendUnits () {
    
            let legendUnits = [];
            if (this.displayColorSchemeSelected === 'wzscheme') {
                
                legendUnits = this.legendWeatherZones;
            } else if (this.displayColorSchemeSelected === 'lmpscheme' ) {
                let lmpRanges = this.getLMPRanges();
                legendUnits = lmpRanges;
            }
            else {
                legendUnits = Object.values(this.realTimeTypes)
            }
            return legendUnits;
        };
    
        this.getSubListFilters = function getSubListFilters(attrType) {

            this.$log.log("attrType: ", attrType);  //make compiler happy for now
            let subListFilters = {};
    
                for (let i = 0; i < this.attrOrder.length; i++) {
                    let name = this.attrOrder[i].name;
                    let srchtag = this.attrOrder[i].srchtag;
                    let srchtagname = this.attrOrder[i].srchtagname;
    
                    if (this.displayAttrFiltersSelected[name] === true) {
                        subListFilters[name] = { srchtagname: srchtagname, srchtag: srchtag };
                    }
                }
    
            return subListFilters;
        };
    
    
    
        this.closeAllChildren = function closeAllChildren() {
    
            if ( Object.keys(this.openChildren).length > 0 ) {
                // close all chidlren
                let openDDs = this.cloneObj(this.openChildren);
                for ( let k in openDDs) {
                    this.toggleChildren(k,openDDs[k],true);
                }
                // change all Y first
                for ( let k in this.weatherZoneSettings) {
                    let defaultY = this.weatherZoneSettings[k].defaultY;
                    this.weatherZoneSettings[k].sizeY = defaultY;                  
                }
                // then move row (to avoid pushing/rearrange chaos)
                for ( let k in this.weatherZoneSettings) {
                    let defaultRow = this.weatherZoneSettings[k].defaultRow;
                    this.weatherZoneSettings[k].row = defaultRow;
                }
            }
        
        };
    
        this.resetFilterOptions = function resetFilterOptions () {
            
            this.$rootScope.clearFilters();
            this.setAttrDefaults();
            this.setWZDefaults();        
            this.setRSTDefaults();
    
            this.lastUpdatedFilters = new Date();
            
        };
    
        this.cancelOptions = function cancelOptions() {
    
            if (this.hideLoading) {
                this.displayModeSelected = this.currentModeSelected;
                this.displayMode = this.currentModeSelected;
                this.displayGroupModeSelected = this.currentGroupModeSelected;
                this.displayGroupMode = this.currentGroupModeSelected;
                this.displayValueTypeSelected = this.currentValueTypeSelected;
                this.displayValueType = this.currentValueTypeSelected;
                this.displayColorSchemeSelected = this.currentColorSchemeSelected;
                this.displayColorScheme = this.currentColorSchemeSelected;
                this.displayWeatherZoneFiltersSelected = this.currentWeatherZoneFiltersSelected;
                this.displayWeatherZoneFilters = this.currentWeatherZoneFiltersSelected;
                this.displayAttrFiltersSelected = this.cloneObj(this.currentAttrFiltersSelected);
                this.displayAttrFilters = this.cloneObj(this.currentAttrFiltersSelected);
                this.displayWZFilters = this.currentWZFiltersSelected.slice();
                this.displayWZFiltersSelected = this.currentWZFiltersSelected.slice();
                this.displayRSTFilters = this.currentRSTFiltersSelected.slice();
                this.displayRSTFiltersSelected = this.currentRSTFiltersSelected.slice();
            }
        };
    
    
    
        this.isWZFiltered = function isWZFiltered () {
            let slen = (this.wzSelectList) ? this.wzSelectList.length : 0;
            let dlen = (this.displayWZFiltersSelected) ? this.displayWZFiltersSelected.length : 0;
            let isFiltered = (slen !== dlen) ? true : false;
            return isFiltered;
        };
    
        this.isRSTFiltered = function isRSTFiltered () {
           return (this.displayRSTFiltersSelected.length !== this.rstSelectList.length) ? true : false;
        };
    
    
        this.isAttrFiltered = function isAttrFiltered () {
            return (this.filtersOpened) ? Object.values(this.displayAttrFiltersSelected).slice(1,1+6).includes(true) : false;
        };
    
        this.isFiltered = function isFiltered(){
            let isFilteredOn;
            if ( this.filtersOpened ) {
                isFilteredOn = (this.isAttrFiltered() || this.isWZFiltered() || this.isRSTFiltered() || this.isSearchBoxFiltered()) ? true : false;
            } else { isFilteredOn = false }
    
            return isFilteredOn;
        };
    
        this.isSearchBoxFiltered = function isSearchBoxFiltered() {
            let isFiltered;
            if ( this.filtersOpened ) {
                isFiltered = (this.searchParams.query || this.searchParams.station || this.searchParams.unit || this.searchParams.fuel || this.searchParams.weatherzone || this.searchParams.status) ? true : false;
            } else { isFiltered = false }
            return isFiltered;
        };
    
        this.isWZDisplayFiltered = function isWZDisplayFiltered () {
            let isFiltered;
            if ( this.filtersOpened ) {
                isFiltered = (this.displayWZFilters.length !== this.wzSelectList.length) ? true : false;
            } else { isFiltered = false }
    
            return isFiltered;
        };
    
        this.isRSTDisplayFiltered = function isRSTDisplayFiltered () {
            let isFiltered;
            if ( this.filtersOpened ) {
                isFiltered = (this.displayRSTFilters.length !== this.rstSelectList.length) ? true : false;
            } else { isFiltered = false }
    
            return isFiltered;
        };
    
        this.isAttrDisplayFiltered = function isAttrDisplayFiltered () {
            let isFiltered;
            if ( this.filtersOpened ) {
                isFiltered = (Object.values(this.displayAttrFilters).slice(1,1+2).includes(true)) ? true : false;
            } else { isFiltered = false }
    
            return isFiltered;
        };
    
        this.isDisplayFiltered = function isDisplayFiltered(){
    
            let rtnVal;
            if (this.filtersOpened) {
                rtnVal = (this.isAttrDisplayFiltered() || this.isWZDisplayFiltered() || this.isRSTDisplayFiltered() ) ? true : false;
            } else { rtnVal = false }
            
            return rtnVal;
    
        };
    
        this.getFilteredAttrStations = function getFilteredAttrStations(stnObj) {
    
            //let stn = stnObj.stationName;
            let stnAttrsMatched = 0;
    
            if (this.displayAttrFiltersSelected['None'] === true) {
                stnAttrsMatched = 1;
            } else {
                let subListFilters = this.getSubListFilters();
    
                for (let i = 0; i < stnObj.units.length; i++) {
                    let unit = stnObj.units[i];
                    let unitAttrs = [];
    
                    for (let k in subListFilters) {
                        let tagname = subListFilters[k].srchtagname;
                        let tag = subListFilters[k].srchtag;
    
                        if (unit.properties[tagname] && unit.properties[tagname] === tag) {
                            unitAttrs.push('true');
                        } else { unitAttrs.push('false') }
    
                    }
    
                    if ( !unitAttrs.includes('false') ) { stnAttrsMatched++ }
    
                }
            }
    
            //if (stnObj.stationName === 'ACACIA' ) { this.$log.log("Acacia has ", stnAttrsMatched, "units that match attribute")};
    
            return (stnAttrsMatched > 0)  ? true : false ;
        };
    
        this.getFilteredWZStations = function getFilteredWZStations(stnObj) {
            
            //let stn = stnObj.stationName;
            let unitAttrsMatched = [];
            let rtnVal;
    
            if (this.filtersOpened === false) {
                rtnVal = true;
            } else {
            
                if ( this.isFiltered()) {
                    if (this.displayWZFiltersSelected.length < 8) {
                        for (let i = 0; i < stnObj.units.length; i++) {
    
                            let unit = stnObj.units[i];
                            let wz = unit.weatherZone;
    
                            if (wz !== undefined && this.isInList(wz, this.displayWZFiltersSelected)) {
                                unitAttrsMatched.push('true');
                            }
    
                        }
                        rtnVal = unitAttrsMatched.includes('true');
                    } else { rtnVal = true }
                } else { rtnVal = true }
            }
    
            return rtnVal;
        };
    
        this.getFilteredRSTStations = function getFilteredRSTStations(stnObj) {
             
            let unitAttrsMatched = [];
            // HAVE AARON SEE Number in console!  if (stnObj.stationName === 'ACACIA') { this.$log.log("stnObj: ", stnObj)};
    
            if ( this.filtersOpened && this.displayRSTFiltersSelected.length < 19) {
                for (let i = 0; i < stnObj.units.length; i++) {
    
                    let unit = stnObj.units[i];
                    let status = unit.attributes['RST'];
                    if (this.isRSTFiltered()) {
                        if (status === undefined) {
                            if (this.parentUnits[unit.Path]) {
                            // check children
                                let childUnits = this.parentUnits[unit.Path].childUnits;
                                for (let m = 0; m < childUnits.length; m++) {
                                    if (this.isInList(childUnits[m].attributes.RST, this.displayRSTFiltersSelected)) { unitAttrsMatched.push('true') }
                                }
                            } else if (unit.isDCTie) {
                                let flow = ( !(unit.dctie.DCTieAttrs === undefined || unit.dctie.DCTieAttrs.attributes === undefined) ) ? unit.dctie.DCTieAttrs.attributes.Flow : 0;
                                status = (flow >= 1 || flow < -1) ? 'ON' : 'OFF';
                                if (this.isInList(status, this.displayRSTFiltersSelected)) { unitAttrsMatched.push('true') }
                            }
                        }
                        else if (this.isInList(status, this.displayRSTFiltersSelected)) {
                            unitAttrsMatched.push('true');
                        }
                    } else { unitAttrsMatched.push('true') }
    
                }
            }   else { unitAttrsMatched.push('true') }
    
            return unitAttrsMatched.includes('true');
        };
    
    
        this.isFilterAttrMatch = function isFilterAttrMatch(unit) {
    
            let unitAttrsMatched = true;
    
            //if (unit.stationName === 'ACACIA') { this.$log.log("checking!")};
    
            if ( this.isAttrFiltered() ) {
    
                let subListFilters = this.getSubListFilters();
                let unitAttrs = [];
    
                for (let k in subListFilters) {
                    let tagname = subListFilters[k].srchtagname;
                    let tag = subListFilters[k].srchtag;
    
                    if (k === 'On' || k === 'Off') { // search attributes
                        if (unit.attributes[tagname] && unit.attributes[tagname] === tag) {
                            unitAttrs.push('true');
                        }
                        else { unitAttrs.push('false') }
                    } else { // search properties
                        if (unit.properties[tagname] && unit.properties[tagname] === tag) {
                            unitAttrs.push('true');
                        } else { unitAttrs.push('false') }
                    }
                }
                unitAttrsMatched = (!unitAttrs.includes('false')) ? true : false;
            }
    
            return unitAttrsMatched;
        };
    
        this.isFilterRSTMatch = function isFilterRSTMatch(unit) {
            let rstMatch = false;
            if (this.isRSTFiltered()) {
                if ( (this.isInList(unit.attributes['RST'], this.displayRSTFiltersSelected)) || 
                     (unit.attributes['RST'] === undefined && this.parentUnits[unit.Path]) ) {
                        rstMatch = true;
                } else if (unit.isDCTie) {
                    
                    let flow = ( !(unit.dctie.DCTieAttrs === undefined || unit.dctie.DCTieAttrs.attributes === undefined) ) ? unit.dctie.DCTieAttrs.attributes.Flow : 0;
                    let status = (flow >= 1 || flow < -1) ? 'ON' : 'OFF';
                    if (this.isInList(status, this.displayRSTFiltersSelected)) { rstMatch = true }                
                }
            } else { rstMatch = true }
    
            return rstMatch;
        };
    
        this.getSum = function getSum(total, num) {
            return total + num;
        };
    
        this.toCamelCase = function toCamelCase (ccstr){
            let split = ccstr.split(' ');
    
            //iterate through each of the "words" and capitalize them
            for (let i = 0, len = split.length; i < len; i++) {
            split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
            }
    
            return split.join(' ');
    
        };
    
        this.getRSTs();
        this.setWZSelections();
        this.getWZs();
        this.getAllUnits();   
    
        this.setAttrDefaults();
        this.setRSTDefaults();
    
        // keep these on init (outside of setDefaults)
        this.displayAttrFiltersSelected = this.cloneObj(this.displayAttrFilters);
        this.currentAttrFiltersSelected = this.cloneObj(this.displayAttrFilters);
        this.currentRSTFiltersSelected = this.rstSelectList.slice();   
    
        this.getTotalSumOfValues = function getTotalSumOfValues(wz) {
    
            let MWs = [0];
            let sum = 0;
    
            for (let k in this.zones[wz].stations) {
                for ( let i = 0; i < this.zones[wz].stations[k].units.length; i++) {
    
                    let u = this.zones[wz].stations[k].units[i];
                    let flow = (u.isDCTie && u.dctie.DCTieAttrs !== undefined ) ? u.dctie.DCTieAttrs.attributes.Flow : 0;
                    let mw = (!isNaN(u.attributes.MW)) ? u.attributes.MW : 0;
                    mw = (u.isDCTie) ? flow : mw;
                    MWs.push(Math.trunc(mw));
                }
            }
            sum = MWs.reduce(this.getSum); 
    
            return sum; 
        };
    
        this.getSumOfWZ = function getSumOfWZ(wz) {
            let MWs = this.wzTotals[wz];
            this.wzTotals[wz] = 0;
            let mwSum = MWs; 
            
            return Math.trunc(mwSum);
        };
    
        this.trimWZLayout = function trimWZLayout(wZone,resetFlg) {
    
            let zones = (wZone === 'all') ? ['NORTH','NORTH_CENTRAL','SOUTH_CENTRAL','SOUTHERN','COAST'] : [wZone];
            let wzHeight;
            let sizeY;
            let sizeYHeight;
            let newsize;
    
            for (let w = 0; w < zones.length; w++) {
    
                let wz = zones[w];
                let wzid = wz + 'gridster';
    
                if ( this.displayGroupModeSelected === 'wzgroup' && resetFlg === false) {
    
                    sizeY = Number(this.weatherZoneSettings[wz].sizeY) - 1; //omit heading row
                    sizeYHeight =  sizeY * this.gridsterRowHeight;
                    wzHeight = document.getElementById(wzid).offsetHeight;
     
                    if ( wzHeight !== sizeYHeight ) {
                        newsize = Math.ceil(wzHeight / this.gridsterRowHeight) + 1; // add heading row
                        if (this.weatherZoneSettings[wz].sizeY !== newsize) {
    
                            let delta = this.weatherZoneSettings[wz].sizeY - newsize;
                            this.weatherZoneSettings[wz].sizeY = newsize;              
                            let indexOfWZ = this.weatherZonesOrder.findIndex(i => i.name === wz);
    
                            for (let j = indexOfWZ + 1; j < this.weatherZonesOrder.length; j++) {
    
                                let curWZ = this.weatherZonesOrder[j].name;
                                let previousWZ = (curWZ === 'COAST') ? 'NORTH_CENTRAL' : this.weatherZonesOrder[j-1].name;
                                if ( this.weatherZoneSettings[curWZ].row > (this.weatherZoneSettings[previousWZ].row + this.weatherZoneSettings[previousWZ].sizeY) && this.weatherZoneSettings[curWZ].row > this.weatherZoneSettings[curWZ].defaultRow) {
                                    let newrow = ( delta > -1 ) ? this.weatherZoneSettings[curWZ].row - delta : this.weatherZoneSettings[curWZ].row + delta;
                                    let row = Math.max(this.weatherZoneSettings[curWZ].defaultRow, newrow );
                                    this.weatherZoneSettings[curWZ].row = row; 
                                }
                            }  
                        }
                    } 
                }
            }
        };
    
        this.sleep = function sleep(msecs) {
            let start = new Date().getTime();
            for (let i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > msecs){
                break;
                }
            }
        };
    
        this.setUnitLength = function setUnitLength(unitId) {
            let width = document.getElementById(unitId).offsetWidth;
            this.resourceList[unitId].namelength = width;
        };

    

        
    }

    $onInit() {
        
        this.lodash_version = _.VERSION;
                
        this.moment_version = moment.version;
        
        this.angularLogo = angularLogo;

        // akdemo specifics

        this.windowWidth = Number(window.innerWidth);

        if (this.windowWidth < 1920) { 
            this.displayGroupMode = 'none';
            this.displayGroupModeSelected = 'none'; 
            this.currentGroupModeSelected = 'none';
            this.startupdefault = 'none';
        }        

        this.window.addEventListener("resize",function () {
            this.windowHeight = Number(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
            if (document.getElementById('all')) {
                let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                let cols = Math.trunc(Number(w) / 101); //110

                Object.assign(document.getElementById('all').style, {
                    '-webkit-column-count': cols,
                    '-moz-column-count': cols,
                    'column-count': cols,
                    '-webkit-column-gap': '1px !important',
                    '-moz-column-gap': '1px !important',
                    'column-gap': '1px !important',
                });
            }
        });
    }

    getWeatherZoneStations () {
        return this.weatherZones;  
    } 

    setOptions () {


        this.displayModeSelected = this.displayMode;
        this.displayGroupModeSelected = this.displayGroupMode;
        this.displayValueTypeSelected = this.displayValueType;
        this.displayColorSchemeSelected = this.displayColorScheme;
        this.displayAttrFiltersSelected = this.cloneObj(this.displayAttrFilters);
        this.displayWZFiltersSelected = this.displayWZFilters.slice();
        this.displayRSTFiltersSelected = this.displayRSTFilters.slice();
        this.lastUpdatedFilters = new Date();

    }

    resetOptions () {

        this.displayModeSelected = '';
        this.displayMode = '';
        this.displayGroupModeSelected = '';
        this.displayGroupMode = '';
        this.displayValueTypeSelected = 'MW';
        this.displayValueType = 'MW';
        this.displayColorSchemeSelected = 'unitscheme';
        this.displayColorScheme = 'unitscheme';
        this.resetFilterOptions();
        this.setGroupDefaults();  
        this.lastUpdatedFilters = new Date();      

    }

    getAdditionalInfo (blk,qck,pan,rst) {

        this.addInfoList = [];

        if (blk === true) { this.addInfoList.push("Is Black Start") }
        if (qck === true) { this.addInfoList.push("Is Quick Start") }
        if (rst === "OFF") { this.addInfoList.push("Is Off") }
        if (rst === "STARTUP") { this.addInfoList.push("Is Starting Up") }
        if (rst === "SHUTDOWN") { this.addInfoList.push("Is Shutting Down") }
        if (pan === "MothballedGeneration") { this.addInfoList.push("Is Mothballed") }

        return (this.addInfoList.length > 0) ? true : false;

    }

    getUnitVal (unit,incrementTotal,tag) {

        let rtnVal;

        if ( this.notready ) {             
            rtnVal = 0; 
        } else {
            
            let flow = ( !(unit.dctie.DCTieAttrs === undefined || unit.dctie.DCTieAttrs.attributes === undefined) ) ? unit.dctie.DCTieAttrs.attributes.Flow : 0;
            let unitMW = ( !(unit.attributes === undefined) ) ? unit.attributes.MW : 0;
            let mw = (unit.isDCTie) ? flow : unitMW;
            let curMW = ( incrementTotal && mw !== undefined && (mw >= 1 || mw <= -1)) ? Math.trunc(Number(mw)) : 0;
            this.stnTotals[unit.stationName] = this.stnTotals[unit.stationName] + curMW;
            if (incrementTotal & this.displayGroupModeSelected === 'wzgroup') {
                this.wzTotals[unit.weatherZone] = this.wzTotals[unit.weatherZone] + curMW;
            }

            if (tag === 'MW' && mw !== undefined) {
                rtnVal = (unit.isDCTie) ? this.getDCTieVal(mw) : this.getVal(mw);
            } else if (tag === 'LMP' && unit.attributes.LMP !== undefined) {
                rtnVal = this.getPrice(unit.attributes.LMP);
            }
            else { rtnVal = '--' }
        } 

        this.displayedCount++;
 

        return rtnVal;
    }

    getToolTipMWVal (unit) {
        let rtnVal = (unit.isDCTie) ? unit.dctie.DCTieAttrs.attributes.Flow : unit.attributes.MW;
        return this.fmtNum(Math.trunc(rtnVal));
    }

    
    isTrimmed(unitId) {

        if (this.devmode === true) {

            let trimmedUnits = Object.keys(this.currentTrimmedUnits);
            if (trimmedUnits.length > 0) { 

                if (trimmedUnits.length === 1) { 
                    this.currentTrimmedUnits[unitId + ' logCnt'] = 0;
                    this.currentTrimmedUnits['firstId'] = unitId;
                    this.currentTrimmedUnits['reported'] = false;
                } else {
                    if (this.currentTrimmedUnits['firstId'] !== trimmedUnits[0]) {
                        this.currentTrimmedUnits['firstId'] = trimmedUnits[0];
                        this.currentTrimmedUnits[trimmedUnits[0] + ' logCnt'] = 0;
                        this.currentTrimmedUnits['reported'] = false;
                    }
                }            
                
                if ( unitId === this.currentTrimmedUnits['firstId'] ) { 
                    
                    let logid = this.currentTrimmedUnits['firstId'] + ' logCnt';
                    let logcnt = this.currentTrimmedUnits[logid];
                    this.currentTrimmedUnits[logid]++;

                    let currentTimestamp = new Date();
                    let lastLogSecs = (currentTimestamp - this.lastLoggedToConsole) / 1000;
                    
                    if ( this.currentTrimmedUnits['reported'] === false && lastLogSecs > 60 ){ 
                        if ( logcnt > 50 && this.currentTrimmedUnits['reported'] === false ) {
                            this.$log.log("Trimmed: ", this.currentTrimmedUnits);
                            this.lastLoggedToConsole = currentTimestamp;
                            this.currentTrimmedUnits['reported'] = true;
                            this.currentTrimmedUnits[logid] = 0;

                        }
                    } 
                    if (this.currentTrimmedUnits[logid] === 1000) { this.currentTrimmedUnits['reported'] = false }
                }          
            }
        }

    }

    getShortName (parent,unit,unitId) {
        let nm;
        if ( this.notready ) {
            nm = unit.Name[unit.Path];
        }
        else if (parent === 'NA' && unit.attributes !== undefined) { 
            let unitname;  
            let largeValue = false;

            if (unit.isDCTie) {
                unitname = unit.dctie.DCTieName;
            } else {
                unitname = unit.Name[unit.Path];
                if (this.displayValueTypeSelected === 'LMP' && unit.attributes !== undefined && unit.attributes.LMP) {                    
                    largeValue = (unit.attributes.LMP > 99 || unit.attributes.LMP < -99 ) ? true : false;
                } else if (this.displayValueTypeSelected === 'MW' && unit.attributes !== undefined && unit.attributes.MW) {
                    largeValue = ( Math.trunc(unit.attributes.MW) > 99999 ) ? true : false;
                } else { delete this.currentTrimmedUnits[unit.stationName + " " +  unit.Name[unit.Path]] }                    
            }
            largeValue = false; //REMOVE ME
            nm = unitname;
            if ( !(unitname === undefined) ) {

                if (largeValue === true) {

                    let currentTimestamp = new Date();
                    let filterseconds = (currentTimestamp - this.lastUpdatedFilters) / 1000;

                    if (filterseconds > 10) {

                        if ( this.resourceList[unitId].namelength === 0) {
                            this.setUnitLength(unitId);
                        }
                    
                        if ( (unit.HasChildren && this.resourceList[unitId].namelength > 43) || (unit.HasChildren === false && this.resourceList[unitId].namelength > 49)) {
                            
                            if ( this.resourceList[unitId].trimmedName === undefined ) {
                                let trimlen = (unit.HasChildren) ? -3 : -5;
                                let suffix = unit.Name[unit.Path].split('_').pop();
                
                                nm = ( unit.Name[unit.Path].indexOf('_') > -1 && isNaN(parseInt(suffix)) ) ? suffix : '..' + unit.Name[unit.Path].slice(trimlen);
                                this.resourceList[unitId].trimmedName = nm;
                            } else { nm = this.resourceList[unitId].trimmedName; }
                            this.currentTrimmedUnits[unit.stationName + " " + unit.Name[unit.Path]] = { trimmedName: nm };
                            this.isTrimmed(unit.stationName + " " + unit.Name[unit.Path]);
    
                        }
                    }
                }
            }

        } else {
            let child = unit.Name[unit.Path];
            let shortName = (child.indexOf(parent) > -1) ? child.split(parent)[1] : child;
            nm = shortName.replace('_','');
        }
        
        return nm;
    }

    getMWGroupTotal(wzName) {
        //return ( this.showFilteredMWTotal() ) ? this.fmtNum(this.getSumOfWZ(wzName)) : this.fmtNum(this.getTotalSumOfValues(wzName));
        return this.fmtNum(this.getSumOfWZ(wzName));
    }

    getMWGroupTotalStyle() {
        let color = (this.isFiltered()) ? 'orange' : 'white';
        return { 'color': color };
    }

    getLMPRanges () {
        let ranges = [];
        for (let k = 0; k < this.lmpOrder.length; k++) {
            let z = this.lmpOrder[k];
            ranges.push({ type: z.name,
                    classname: z.classname });
        }
        return ranges;

    }

    isFilterMatch(unit) { 

        let isFilterMatch;

        if (this.isFiltered()) {
            let currentTimestamp = new Date();
            let seconds = (currentTimestamp - this.substationList[unit.stationName].lastUnitUpdated) / 1000;
            let filterseconds = (currentTimestamp - this.lastUpdatedFilters) / 1000;

            let unitId = 'unit' + unit.stationName + unit.Name[unit.Path];
            if (seconds > 8 || filterseconds < 10) {

                if ( unit.isChild === false && unit.Path in this.childUnits ) {
                    isFilterMatch = false;  //skip these dups
                } else {
                    isFilterMatch = (this.isFilterAttrMatch(unit) && this.isFilterRSTMatch(unit)) ? true : false;
                }
                this.substationList[unit.stationName].lastUnitUpdated = currentTimestamp;
                this.resourceList[unitId].lastFilterMatchStatus = isFilterMatch;
                
            } else {
                isFilterMatch = this.resourceList[unitId].lastFilterMatchStatus;
            }
        } else { isFilterMatch = true }  

        return isFilterMatch;     
    }

    getSumOfStn(stn) {
        let MWs = Math.trunc(this.stnTotals[stn]);
        this.stnTotals[stn] = 0;
        let mwSum = this.fmtNum(MWs); 
        
        return mwSum;
    }

    getTotalStns() {
        let vals = Object.values(this.stnTotals);
        let sum = 0;
        if (vals !== undefined && vals.length > 0) {
            
            sum = vals.reduce(this.getSum);
        }
        return sum;
    }

    getDisplayCount(){
        let count = this.displayedCount;

        if ( this.wzGrpsReady === false ) {
            let ready = ( this.displayedCount > 0 && (this.displayedCount === Object.keys(this.allUnits).length ) ) ? true : false;
            if ( ready === true && document.getElementById('COASTgridster') !== undefined  && document.getElementById('COASTgridster').offsetHeight > 0) {
                this.wzGrpsReady = true;
                this.trimWZLayout('all',false);
            }
        }

        this.displayedCount = 0;
        return count;
    }

    getTotalCount(){
        return Object.keys(this.allUnits).length;
    }

    selectUnitName (unit) {
        return (unit.isDCTie) ? unit.dctie.DCTieName : unit.Name[unit.Path];
    }

    showFilteredMWTotal() {
        return (this.isFiltered() && this.displayValueTypeSelected === 'MW');
    }

    isLowMW(unit) {
        let rtnVal;
        if (this.notready) { rtnVal = true }
        else {
            let flow = ( !(unit === undefined || unit.dctie.DCTieAttrs === undefined ) ) ? unit.dctie.DCTieAttrs.attributes.Flow : 0;
            let mw =  (!(unit === undefined || unit.attributes === undefined)) ? unit.attributes.MW : 0;
            mw = (unit.isDCTie) ? Math.abs(Math.trunc(flow)) : mw ;
            rtnVal = (mw < 1) ? true : false;
        }
        return rtnVal;
    }

    updateUnitList(srchstr) {
        let filtered = [];
        if (this.searchParams.station || this.searchParams.fuel || this.searchParams.unit || this.searchParams.weatherzone || this.searchParams.status) {
            for (let k = 0; k < this.unitList.length; k++) { 

                if (this.includeStation(this.unitList[k])) {
                    filtered.push(this.unitList[k]);
                }                

            }     
            
        } else {
            filtered = this.$filter('filter')(this.unitList,srchstr);
        }
        
        filtered = this.$filter('orderBy')(filtered, 'stationName');
        this.filteredUnitList = filtered;
    }

    getFilteredStations(stnObj) {

        let rtnVal;
        let currentTimestamp = new Date();
        let seconds = (currentTimestamp - this.substationList[stnObj.stationName].lastUpdated) / 1000;
        let filterseconds = (currentTimestamp - this.lastUpdatedFilters) / 1000;

        if (this.filtersOpened) {

            if (seconds > 9 || filterseconds < 10) {

                if (this.isFiltered()) {
                    rtnVal = (this.getFilteredAttrStations(stnObj) && 
                            this.getFilteredRSTStations(stnObj) && 
                            this.getFilteredWZStations(stnObj) && 
                        ( (this.filteredStations(stnObj).length) > 0) ) ? true : false;

                    //if ( stnObj.stationName === 'ACACIA' ) { this.$log.log("station filter check: ", rtnVal) };

                } else { 
                    rtnVal = true; 
                    //if ( stnObj.stationName === 'ACACIA' ) { this.$log.log("this.isFiltered: ", this.isFiltered(), "secs: ",seconds," filtsecs: ", filterseconds) };
                } 
                this.substationList[stnObj.stationName].lastUpdated = currentTimestamp; 
                this.substationList[stnObj.stationName].lastStationFilterStatus = rtnVal;

                    
            } else { 
                rtnVal = this.substationList[stnObj.stationName].lastStationFilterStatus;
            }
        } else { rtnVal = true }
        
        return rtnVal;
    }

    filteredStations(stn) {

        let filtered = [];
        //let chks = [];

        if (this.searchParams.station || this.searchParams.fuel || this.searchParams.unit || this.searchParams.weatherzone || this.searchParams.status || this.searchParams.query) {    
            if (this.includeStation(stn)) {
                filtered.push(stn);
            }           
        } else { filtered.push(stn) }

        return filtered;
    }

    filteredUnits(stnUnits) {

        let filtered = [];
        if (this.filtersOpened) { 
        
            if (this.searchParams.fuel || this.searchParams.unit || this.searchParams.weatherzone || this.searchParams.status || this.searchParams.query) {  
                for (let j = 0; j < stnUnits.length; j++) { 
                    if (this.includeUnit(stnUnits[j])) {
                        filtered.push(stnUnits[j]);
                    } 
                }
            } else { filtered = stnUnits }                                      
        } else { filtered = stnUnits }

        return filtered;
    }

    orderedStations(fld,list) {
        return this.$filter('orderBy')(list,fld);
    }

    includeStation(station) {
 
        let unitsIncluded = station.units.length;
        if (this.searchParams.station) {
            if ( station.stationName.indexOf(this.searchParams.station.toUpperCase()) < 0) { unitsIncluded = 0 }                       
        }

        if (unitsIncluded > 0 ) {
            if ( this.searchParams.unit || this.searchParams.fuel || this.searchParams.weatherzone || this.searchParams.status || this.searchParams.query ) {
                unitsIncluded = 0;
                for (let j = 0; j < station.units.length; j++) { 
                    if ( this.includeUnit(station.units[j]) === true ) { unitsIncluded++ }  
                }  

            }
        }

        return ( unitsIncluded === 0 ) ? false : true ; 
    }

    includeWZ(wz) {
        let rtnVal;
        if ( this.filtersOpened && this.isWZFiltered() ) {
            rtnVal = this.isInList(wz,this.displayWZFiltersSelected);
        } else { rtnVal = true }
        return rtnVal;
    }

    includeWZTotal(wz) {
        let rtnVal;
        if (this.search !== undefined && this.search !== '') {
            rtnVal = this.isInList(this.search,wz.toUpperCase());
        } else { rtnVal = true }
        return rtnVal;
    }

    includeUnit(unit) {
        let chks = [];
        let childUnits = (unit.HasChildren === true) ? this.parentUnits[unit.Path].childUnits : [];

        if ( this.searchParams.unit ) {
            let nm = (unit.isDCTie) ? unit.dctie.DCTieName : unit.Name[unit.Path] ;
            if ( nm.indexOf(this.searchParams.unit.toUpperCase()) > -1 ) {
                chks.push(true);
            } else if ( unit.HasChildren === true ) {
                let childchks = [];
                for (let j = 0; j < childUnits.length; j++) { 
                    let nmd = (childUnits[j].isDCTie) ? childUnits[j].dctie.DCTieName : childUnits[j].Name[childUnits[j].Path];
                    if ( nmd.indexOf(this.searchParams.unit.toUpperCase()) > -1) { 
                        childchks.push(true);
                    }
                }
                if ( !childchks.includes(true) ) { chks.push(false) }
            } else { chks.push(false) }
        }
        if ( this.searchParams.fuel ) {
            if ( unit.properties.FuelType.toUpperCase().indexOf(this.searchParams.fuel.toUpperCase()) > -1 ) {                
                chks.push(true);
            } else if ( unit.HasChildren === true ) {
                let childchks = [];
                for (let j = 0; j < childUnits.length; j++) { 
                    if ( childUnits[j].properties.FuelType.indexOf(this.searchParams.fuel.toUpperCase()) > -1) { 
                        childchks.push(true);
                    }
                }
                if ( !childchks.includes(true) ) { chks.push(false) }
            } else { chks.push(false) }
        }
        if ( this.searchParams.weatherzone ) {
            if ( unit.weatherZone.indexOf(this.searchParams.weatherzone.toUpperCase()) > -1 ) {                
                chks.push(true);
            } else if ( unit.HasChildren === true ) {
                let childchks = [];
                for (let j = 0; j < childUnits.length; j++) { 
                    if ( childUnits[j].weatherZone.indexOf(this.searchParams.weatherzone.toUpperCase()) > -1) { 
                        childchks.push(true);
                    }
                }
                if ( !childchks.includes(true) ) { chks.push(false) }
            } else { chks.push(false) }
        }
        if ( this.searchParams.status ) {
            if ( unit.attributes.RST === this.searchParams.status.toUpperCase() ) {                
                chks.push(true);
            } else if ( unit.HasChildren === true ) {
                let childchks = [];
                for (let j = 0; j < childUnits.length; j++) { 
                    if ( childUnits[j].attributes.RST && childUnits[j].attributes.RST.indexOf(this.searchParams.status.toUpperCase()) > -1) { 
                        childchks.push(true);
                    }
                }
                if ( !childchks.includes(true) ) { chks.push(false) }
            } else if ( unit.isDCTie ) {
                let flow = ( !(unit.dctie.DCTieAttrs === undefined || unit.dctie.DCTieAttrs.attributes === undefined) ) ? unit.dctie.DCTieAttrs.attributes.Flow : 0;
                let status = (flow >= 1 || flow < -1) ? 'ON' : 'OFF';
                if ( this.searchParams.status.toUpperCase() === status ) { chks.push(true) }
                else { chks.push(false) }     
            } else { chks.push(false) }
        }      
        if ( this.searchParams.query ) {
            let filtered = this.$filter('filter')([unit],this.searchParams.query);
            if ( filtered.length > 0 ) {
                chks.push(true);
            } else if ( unit.HasChildren === true ) {
                filtered = this.$filter('filter')(childUnits,this.searchParams.query);
                if ( !filtered.length > 0 ) { chks.push(false) }
            } else { chks.push(false) }
        }

        return ( chks.includes(false) ? false : true );

    }

    selectTrimmedDDUnit(unit) {
        let rtnVal;
        let largeValue = false;
        
        if (unit.HasChildren) {
            if (this.displayValueTypeSelected === 'LMP') {
                if (unit.attributes !== undefined && unit.attributes.LMP) {                    
                    largeValue = (unit.attributes.LMP > 99 || unit.attributes.LMP < -99 ) ? true : false;
                } 
                rtnVal = (largeValue) ? true : false;
            } else {
                largeValue = ( Math.trunc(unit.attributes.MW) > 9999 ) ? true : false;
                rtnVal = (largeValue) ? true : false;
            }
        } else { rtnVal = false }
        return rtnVal;
    }

    selectTrimmedRegUnit(unit) {
        let rtnVal;
        if (!unit.HasChildren) {
            rtnVal = (unit.weatherZone === 'EAST' && this.displayGroupModeSelected === 'wzgroup') ? true : false;
        } else { rtnVal = false }
        return rtnVal;
    }

    selectTrimmedRegLMPUnit(unit) {
        let rtnVal;
        let largeValue = false;
        if (this.displayValueTypeSelected === 'LMP' && unit.attributes !== undefined && unit.attributes.LMP) {                    
            largeValue = (unit.attributes.LMP > 99 || unit.attributes.LMP < -99 ) ? true : false;
        }

        if (!unit.HasChildren && largeValue) {
            rtnVal = (this.displayValueTypeSelected === 'LMP' && this.displayGroupModeSelected === 'wzgroup') ? true : false;
        } else { rtnVal = false }
        return rtnVal;
    }
}