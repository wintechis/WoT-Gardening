/* API documentation see:
  https://github.com/nkolban/ESP32_BLE_Arduino/blob/master/src/BLEDevice.h
  https://github.com/espressif/esp-idf/blob/7869f4e151/components/bt/host/bluedroid/api/include/api/esp_bt_device.h
  http://www.neilkolban.com/esp32/docs/cpp_utils/html/annotated.html
*/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <esp_bt_device.h>

// to get WiFi MAC address
// IMPORTANT: there are two different MAC addresses - for gatt we will use the BLE MAC address
#include <WiFi.h>

#define bleEspName "ESP32_ble"

bool deviceConnected = false; // default value
int rxload = 0x42; // it's just a guarantee that the only valid values are 1 or 0

BLECharacteristic *bleCharacteristic;

// txValue := transfer data
char* txValue = "off";

long lastMsg = 0;
long lastMsgSend = 0;

// create new UUID https://www.uuidgenerator.net/
// 'service' UUID is a collection of related information
#define SERVICE_UUID "c9c0ba7c-72e1-11ed-a1eb-0242ac120002"

// characteristic UUIDs for ble device/service
// RX - a client WRITE on this channel AND the esp32 server READ from this channel
#define CHARACTERISTIC_UUID_RX "2e48ebbe-72e6-11ed-a1eb-0242ac120002"
// TX - transfer,- what esp32 server will sent
#define CHARACTERISTIC_UUID_TX "35dd80c4-72e6-11ed-a1eb-0242ac120002"

// set const for LED PIN - for testing
#define LED_BUILTIN 2

// setup callbacks onConnect and onDisconnect
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* bleServer) {
    deviceConnected = true;
  };
  void onDisconnect(BLEServer* bleServer) {
    deviceConnected = false;
  }
};

// write access function proofs if input has been received
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();
      
      if (rxValue.length() > 0) { 
        rxload = 42;
        Serial.println("length = " + rxValue.length());
        for (int i = 0; i < rxValue.length(); i++) { 
          rxload = (int)rxValue[i];
        }
      }
    }
};

/* setup the BLE device
  - create server and set characteristics for the servers service
  - after calling the function the BLE server is available and a
    connection via the characteristics rx/tx is established
*/
void setupBLE() {
  
  // create/init ble device
  BLEDevice::init(bleEspName);

  // Create the BLE Server
  BLEServer *bleServer = BLEDevice::createServer();

  // this callback function sets the boolean variable deviceConnected
  // to true or false according to the current state of the ble device
  bleServer->setCallbacks(new MyServerCallbacks());

  // now we create the service with the service UUID
  BLEService *bleService = bleServer->createService(SERVICE_UUID);

  // create a new BLE characteristic associated with the service
  bleCharacteristic = bleService->createCharacteristic(CHARACTERISTIC_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);
  // descriptor can read/write the characteristics of characteristics
  bleCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic *bleCharacteristic = bleService->createCharacteristic(CHARACTERISTIC_UUID_RX, BLECharacteristic::PROPERTY_WRITE);
  bleCharacteristic->setCallbacks(new MyCallbacks());

  // start service and server
  bleService->start();
  // retrieve the advertising object that can be used to advertise the existence of the server.
  bleServer->getAdvertising()->start();
  
  Serial.println("...\nWaiting a client connection to notify...");
}

// get BLE MAC address
void getBLEAddress() {
  const uint8_t* esp_ble_mac = esp_bt_dev_get_address();
  for (int i = 0; i < 6; i++) {
    char str[3];
    sprintf(str, "%02X", (int)esp_ble_mac[i]);
    Serial.print(str);
    if (i < 5) {
      Serial.print(":");
    }
  }
}

void print_device_information() {
  Serial.println("...\n____________________________________________________________________");
  Serial.println("WiFi MAC address of ESP32:\t" + WiFi.macAddress());
  Serial.print("BLE MAC address of ESP32:\t");
  getBLEAddress();
  Serial.println("\nService UUID:\t\t\t" + String(SERVICE_UUID));
  Serial.println("Characteristic UUID RX:\t\t" + String(CHARACTERISTIC_UUID_RX));
  Serial.println("Characteristic UUID TX:\t\t" + String(CHARACTERISTIC_UUID_TX));
  Serial.println("### GATT server");
  Serial.println("gatt://<MAC>/<service>/<characteristic>");  
  Serial.println("____________________________________________________________________\n");

}

void setup() {
  // start serial communication
  Serial.begin(9600);

  // for testing set led buildin
  pinMode(LED_BUILTIN, OUTPUT);

  // setup ble device
  setupBLE();

  // print device information
  print_device_information();
}

// put intern LED 'on' or 'off'
// on :=  0x1 
// off := 0x0 
void putLED_on_off(int rx) {
  if(rx == 0x1) {
    Serial.println("LED on.");
    digitalWrite(LED_BUILTIN, HIGH);
    // set status 'on'
    setStatus("on");
  } else if(rx == 0x0) {
    Serial.println("LED off.");
    digitalWrite(LED_BUILTIN, LOW);
    setStatus("off");
  } else {
    Serial.println("Valid values are: 0x0 | 0x1");
  }
}

// set status 'on' or 'off'
void setStatus(char* status) {
  txValue = status;
}

// returns status 'on' or 'off'
void getStatus() {
  const char* value = txValue;
  bleCharacteristic->setValue(value);
  bleCharacteristic->notify();
}

void loop() {
  long now = millis();
  
  // checks all 0.1 seconds if a new message has received
  if (now - lastMsg > 100) {
      if (deviceConnected && (rxload == 0x1 || rxload == 0x0)) {
        putLED_on_off(rxload);
        rxload = 42;
    }
    lastMsg = now;
  }
  // return status of esp32 - power on or off message all 1 seconds
  if (now - lastMsgSend > 1000) {
    if(deviceConnected) {
      getStatus();
    }
    lastMsgSend = now;
  }
}
