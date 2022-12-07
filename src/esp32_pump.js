// client for ESP32 / pump
// documentation sbo/bdo via firefox and firefox add-on rtf-browser readable
const {Servient} = require('@node-wot/core');
const Bluetooth_client_factory = require('Bluetooth-Bindings/dist/src/Bluetooth-client-factory');
const Bluetooth_lib = require('Bluetooth-Bindings/dist/src/bluetooth/Bluetooth_lib'); 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const servient = new Servient();
servient.addClientFactory(new Bluetooth_client_factory.default());

const td = {
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
    valueString: {
      type: 'string',
      format: 'hex',
      observable: false,
      readOnly: false,
      writeOnly: true,
      description: 'All what I want is to send on or off.',

      forms: [
        {
          href: 'gatt://C8-C9-A3-D8-CF-22/c9c0ba7c-72e1-11ed-a1eb-0242ac120002/2e48ebbe-72e6-11ed-a1eb-0242ac120002',
          op: ['writeproperty'],
            'sbo:methodName': 'sbo:write-without-response',
            contentType: 'application/x.binary-data-stream',
        },
      ],
    },
  },
  actions: {
    writeMode: {
      type: 'string',
      format: 'hex',
      observable: false,
      readOnly: false,
      writeOnly: true,
      description: 'Enable write mode.',

      input: {
        type: 'string',
        format: 'hex',
        enum: ['30', '31'],
        'bdo:bytelength': 1,
        description: 'Turn light on with [led_on - 0x31] or off with [led_off - 0x30].',
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

try {
  servient.start().then(async WoT => {
    console.log("Load thing description...");
    let thing = await WoT.consume(td);

    // get information about the thing
    console.log("Thing name: " + thing.getThingDescription().title);
    console.log("Description: " + thing.getThingDescription().description);
    console.log("action > description: " + thing.getThingDescription().actions.writeMode.description);

    // Connect to Device
    await Bluetooth_lib.connectThing(thing);

    console.log("Connection successful!");
    
    // put led on
    await thing.invokeAction('writeMode', '31');
    console.log("invokeAction successful!\nsleep for 3 seconds...");
    
    await sleep(3000);
    
    // put led off
    await thing.invokeAction('writeMode', '30');
    
    console.log("fished!");
  
    // Read Property
    // let val = await thing.readProperty('valueString');
    // val = await val.value();

    // Close connection
    await Bluetooth_lib.close();
})
} catch (err) {
  console.error('Script error:', err);
};

