var http = require('http');
var Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  // Accessory must be created from PlatformAccessory Constructor
  // Accessory = homebridge.platformAccessory;

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  //UUIDGen = homebridge.hap.uuid;
  
  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  //homebridge.registerPlatform("homebridge-homeComtrol", "homeControl-LesPlace", homeControlLesPlace, true);
  homebridge.registerAccessory("homebridge-lesplace", "GardenLight", homeControlLesPlace);
  
}

homeControlLesPlace.prototype = {
  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "LesPlace manufacturer")
      .setCharacteristic(Characteristic.Model, "Arduino+RSPi model")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");
 
    let switchService = new Service.Switch("Garden Light");
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this));
 
    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  }
};

const request = require('request');
const url = require('url');
 
function homeControlLesPlace(log, config) {
  this.log = log;
  this.getUrl = url.parse(config['getUrl']);
  this.onUrl = url.parse(config['onUrl']);
  this.offUrl = url.parse(config['offUrl']);
}
 
homeControlLesPlace.prototype = {
 
  getSwitchOnCharacteristic: function (next) {
    const me = this;
    request({
        url: me.getUrl,
        method: 'GET',
    }, 
    function (error, response, body) {
      if (error) {
        me.log('STATUS: ' + response.statusCode);
        me.log(error.message);
        return next(error);
      }
      return next(null, body.currentState);
    });
  },
   
  setSwitchOnCharacteristic: function (on, next) {
    const me = this;

    if (on!="off") {
      request({
        url: me.onUrl,
        //body: {'targetState': on},
        method: 'GET',
        //headers: {'Content-type': 'application/json'}
      },
      function (error, response) {
        if (error) {
          me.log('STATUS: ' + response.statusCode);
          me.log(error.message);
          return next(error);
        }
        return next();
      });
    } else {
      request({
        url: me.offUrl,
        //body: {'targetState': on},
        method: 'GET',
        //headers: {'Content-type': 'application/json'}
      },
      function (error, response) {
        if (error) {
          me.log('STATUS: ' + response.statusCode);
          me.log(error.message);
          return next(error);
        }
        return next();
      });

    }
  }
};