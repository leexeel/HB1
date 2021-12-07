import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { HomebridgePlatformIOT } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class nodemcuPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private relayStates = {
    On: true,
    Status : "",
    Brightness: 100,
  };

  constructor(
    private readonly platform: HomebridgePlatformIOT,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'leeXeel INC')
      .setCharacteristic(this.platform.Characteristic.Model, 'nodeMCU')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '001');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    //this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.getService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.Brightness)
    //   .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
    // const status = await this.getStatus();
    // if(status.endsWith("0")){
    //   this.service.updateCharacteristic(this.platform.Characteristic.On, true);
    // } else {
    //   this.service.updateCharacteristic(this.platform.Characteristic.On, false);
    // }
    
    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

      this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
 }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.relayStates.On = value as boolean;

    const rp = require('request-promise');
    const url = 'http://192.168.10.161/REL1';
    rp(url)
    .then()
    .catch(function(err){
    //handle error
    });

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    var relay1 = "";
    console.log("raspuns lung:======================================================================================================================================");


    // var EventEmitter = require("events").EventEmitter;
    // var body = new EventEmitter();

    // var http = require('http');
    // var options = {
    //     host: "192.168.10.161", //Both variables defined earlier in the code this is just a snippet of the http.request part
    //     path: "/getStatus"
    // };
    // const callback = function(response) {
    //   var string = '';
    //   response.on('data', function (blob) {
    //     string += blob;
    //   });
    //   response.on('end', function () {
    //     body.data = string;
    //     body.emit('update');
    //     //console.log(string);
    //   });
    // }
    // http.request(options, callback).end();

    // body.on('update', function () {
    //   console.log("Date in afara obiectului:"+body.data); // HOORAY! THIS WORKS!
    //   relay1 = body.data;
    // });
    relay1 = await this.getStatus();
    console.log("ar fi trebuit sa afiseze ceva 2:"+relay1);
    //this.exampleStates.On = true;
    if( (await relay1).endsWith("0")) {
      this.relayStates.On = true;
      //this.platform.log.debug('Get Characteristic On ->', isOn);
      console.log("cica e on "+relay1);
    }
    else{
      this.relayStates.On = false;
      //this.platform.log.debug('Get Characteristic On ->', isOn);
      console.log("cica e off "+relay1);
    }

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    const isOn = this.relayStates.On;
    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.relayStates.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

  async getStatus(){
    const axios = require('axios')
    let raspuns = "";
    try {
      const { data } = await axios.get('http://192.168.10.161/getStatus');
      raspuns = data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        //handleAxiosError(error);
      } else {
        //handleUnexpectedError(error);
      }
    }
    const ls1 = raspuns.split("<p>");
    const ls2 = ls1[0].split(":");
    const relay1 = ls2[1];
    return Promise.resolve(relay1);
  }
}
