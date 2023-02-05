/**
 * @fileoverview
 * This gateway works like an adapter. Requests can be made using REST-API over HTTP server.
 * The requests are then translated at the level of BLE and in this way the devices are controlled.
 * The WoT Thing Description was used as the description of the interfaces.
 * (https://github.com/wintechis/WoT-Gardening/blob/main/src/gateway.js)
 * Documentation sbo/bdo via firefox and firefox add-on rtf-browser readable.
 */
const {Servient} = require('@node-wot/core');
const Bluetooth_client_factory = require('Bluetooth-Bindings/dist/src/Bluetooth-client-factory');
const Bluetooth_lib = require('Bluetooth-Bindings/dist/src/bluetooth/Bluetooth_lib'); 
const express = require("express");
const app = express();

const port = 8080;
const ip = "192.168.1.61";

// middleware for PUSH requests
app.use(express.json());


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Required steps to create a servient for creating a thing (for more information see node-wot)
const servient = new Servient();

// Bluetooth protocol binding (for more information see Bluetooth-bindings)
servient.addClientFactory(new Bluetooth_client_factory.default());

/**
 * @file thing description based on BLE of a pump and describes an endpoint
 */
const td_pump_ble = {
  '@context': [
    'https://www.w3.org/2019/wot/td/v1',
    'https://www.w3.org/2022/wot/td/v1.1',
    {
      sbo: 'https://freumi.inrupt.net/SimpleBluetoothOntology.ttl#',
      bdo: 'https://freumi.inrupt.net/BinaryDataOntology.ttl#',
    },
    {'@language': 'en'},
  ],
  title: 'Pump',
  description: 'An ESP32 module to control a pump.',
  securityDefinitions: {
    nosec_sc: {
      scheme: 'nosec',
    },
  },
  '@type': 'Thing',
  security: ['nosec_sc'],

  'sbo:hasGAPRole': 'sbo:Peripheral',
  'sbo:isConnectable': true,
  'sbo:hasAdvertisingIntervall': {
    'qudt:numericValue': 2000,
    'qutdUnit:unit': 'qudtUnit:MilliSEC',
  },

  properties: {
    status: {
      type: 'string',
      observable: false,
      enum: ['on', 'off'],
      readOnly: true,
      writeOnly: false,
      description: 'status of power returns on or off',

      forms: [
        {
          href: 'gatt://C8-C9-A3-D8-CF-22/c9c0ba7c-72e1-11ed-a1eb-0242ac120002/35dd80c4-72e6-11ed-a1eb-0242ac120002',
          op: 'readproperty',
            'sbo:methodName': 'sbo:read',
            contentType: 'application/x.binary-data-stream',
        },
      ],
    },
  },
  actions: {
    power: {
      type: 'integer',
      format: 'hex',
      observable: false,
      readOnly: false,
      writeOnly: true,

      input: {
        type: 'integer',
        format: 'hex',
        enum: ['0', '1'],
        'bdo:bytelength': 1,
        description: 'Turns power on with [0x1] or off with [0x0].',
      },

      forms: [
        {
          href: 'gatt://C8-C9-A3-D8-CF-22/c9c0ba7c-72e1-11ed-a1eb-0242ac120002/2e48ebbe-72e6-11ed-a1eb-0242ac120002',
          op: 'invokeaction',
          'sbo:methodName': 'sbo:write-without-response',
          contentType: 'application/x.binary-data-stream',
        },
      ],
    },
  },
};

/**
 * @file thing description based on HTTP of a pump and describes an endpoint
 */
const td_pump_http = {
  '@context': [
    'https://www.w3.org/2019/wot/td/v1',
    'https://www.w3.org/2022/wot/td/v1.1',
    {'@language': 'en'},
  ],
  title: 'Pump',
  description: 'An ESP32 module to control a pump.',
  securityDefinitions: {
    nosec_sc: {
      scheme: 'nosec',
    },
  },
  '@type': 'Thing',
  security: ['nosec_sc'],

  properties: {
    status: {
      type: 'string',
      observable: false,
      readOnly: true,
      writeOnly: false,
      enum: ['on', 'off'],
      description: 'status of power returns on or off',

      forms: [
        {
          href: `http://${ip}:${port}/status`,
          op: 'readproperty',
          'htv:methodName': 'GET',
        },
      ],
    },
  },
  actions: {
    power: {
      type: 'string',
      format: 'hex',
      observable: false,
      readOnly: false,
      writeOnly: true,

      input: {
        type: 'string',
        format: 'hex',
        enum: ['0', '1'],
        description: 'Turns power on with [0x1] or off with [0x0].',
      },

      forms: [
        {
          href: `http://${ip}:${port}/power`,
          op: 'invokeaction',
          'htv:methodName': 'POST',
        },
      ],
    },
  },
};


// this variable will initialize with the function call of 'initConnection' and is used for the http connection
let pump_thing

/**
 * BLE Connection
 * @function initConnection() works on @bluetooth-bindings and @node-wot
 * it consumes the thing description and thereby initializes a BLE connection.
 * @returns connection between RPi and the pump via BLE
 */
function initConnection() {
    try {
      servient.start().then(async WoT => {
        console.log("The thing description of pump BLE is loaded...");
        let thing = await WoT.consume(td_pump_ble);

        // declare thing description outside from this function, so you get access to this variable
        pump_thing = thing

        // Connect to pump BLE device
        await Bluetooth_lib.connectThing(thing);

        console.log("Connection successful!\nYou can start...");
    })
    } catch (err) {
      console.error('Script error:', err);
    };
}

/**
 * HTTP Connection
 * @function app.listen()
 * @param {Number} port port of connection
 * @returns a http server and initialize BLE connection
 */
app.listen(port, () => {
    console.log(`Test app listening at http://${ip}:${port}`);
    initConnection();
});

/**
 * @function app.get()
 * @returns the http thing description of the pump on root directory
 */
app.get('/', (req, res) => {
    res.send(td_pump_http);
});

/**
 * @function app.get()
 * @returns status information of the pump - on or off
 */
app.get('/status', async function(req, res) {
    let status =  await pump_thing.readProperty('status');
    status = await status.value();
    res.send(status.toString());
});

/**
 * @function app.post()
 * @param value will send with a post request: valid values are 1 or 0
 * @returns 'accepted' and will send 1 or 0 to the BLE device or 'Bad Request' and send nothing else
 * @example use "RESTED" Add-On to send a POST request will turn the power on
 *    POST http://<IP>:<PORT>/power
 *    Type: JSON    ( NOTE: even if the JSON type is already preset in the "RESTED" Add-On, it is necessary to set it again.)
 *    Value: value
 *    Key: 1
 */
app.post('/power', async function(req, res) {
    // parse parameter from body to string
    let value = await JSON.stringify(req.body["value"]); 

    if(value === "1") {
        await pump_thing.invokeAction('power', 1);
        res.status(202).send("Accepted");
    } else if (value === "0") {
        await pump_thing.invokeAction('power', 0);
        res.status(202).send("Accepted");
    } else {
        res.status(400).send("Bad Request");        
    }
});


