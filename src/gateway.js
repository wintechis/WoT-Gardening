/* 
    - This gateway works like an adapter. Requests can be made using REST-API over HTTP server. 
      The requests are then translated at the level of BLE and in this way the devices are controlled. 
      The WoT Thing Description was used as the description of the interfaces.
    - Documentation sbo/bdo via firefox and firefox add-on rtf-browser readable
*/
const {Servient} = require('@node-wot/core');
const Bluetooth_client_factory = require('Bluetooth-Bindings/dist/src/Bluetooth-client-factory');
const Bluetooth_lib = require('Bluetooth-Bindings/dist/src/bluetooth/Bluetooth_lib'); 
const express = require("express");
const app = express();

const port = 8080;
const ip = "192.168.1.122";

// middleware for PUSH
app.use(express.json());


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const servient = new Servient();
servient.addClientFactory(new Bluetooth_client_factory.default());

// thing description pump ble
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
  description: 'An EXP32 module to control a pump.',
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
      type: 'string',
      format: 'hex',
      observable: false,
      readOnly: false,
      writeOnly: true,

      input: {
        type: 'string',
        format: 'hex',
        enum: ['30', '31'],
        'bdo:bytelength': 1,
        description: 'Turn power on with [0x31] or off with [0x30].',
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

// http thing description for pump
const td_pump_http = {
  '@context': [
    'https://www.w3.org/2019/wot/td/v1',
    'https://www.w3.org/2022/wot/td/v1.1',
    {'@language': 'en'},
  ],
  title: 'Pump',
  description: 'An EXP32 module to control a pump.',
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
        enum: ['30', '31'],
        description: 'Turn power on with [0x31] or off with [0x30].',
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


// *** BLE Connection ***
// initConnection() works on @bluetooth-bindings and @node-wot; it consumes the thing description and creates a connection between RPi and the pump via BLE
function initConnection() {
    try {
      servient.start().then(async WoT => {
        console.log("Load thing description of pump BLE...");
        let thing = await WoT.consume(td_pump_ble);

        // declare thing description outside from this function, so you get access to this variable
        pump_thing = thing

        // Connect to pump BLE device
        await Bluetooth_lib.connectThing(thing);

        console.log("Connection successful!");
    })
    } catch (err) {
      console.error('Script error:', err);
    };
}

// TODO is closeConnection relevant?
/*function closeConnection() {
    Bluetooth_lib.close();
    console.log("Connection closed.");
}*/



// *** HTTP Connection ***
// start http server and initialize BLE connection
app.listen(port, () => {
    console.log(`Test app listening at http://${ip}:${port}`);
    initConnection();
});

// returns the http thing description of the pump
app.get('/', (req, res) => {
    res.send(td_pump_http);
});

// get status information about the pump - on or off
app.get('/status', async function(req, res) {
    let status =  await pump_thing.readProperty('status');
    status = await status.value();
    res.send(status.toString());
});

// USAGE:   POST http://<IP>:<PORT>/power
//          Type: JSON
//          Value: value Key: 31
// NOTE: even if the JSON type is already preset in the "RESTED" Add-On, it is necessary to set it again. Otherwise the query will not work.
app.post('/power', async function(req, res) {
    // parse parameter from body to string
    let value = await JSON.stringify(req.body["value"]); 

    if(value === "31") {
        pump_thing.invokeAction('power', "31");
        res.status(202).send("Accepted");
    } else if (value === "30") {
        pump_thing.invokeAction('power', "30");
        res.status(202).send("Accepted");
    } else {
        res.status(400).send("Bad Request");        
    }
});


