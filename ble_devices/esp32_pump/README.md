# ESP32

The Freenove ESP32-Wrover-dev is a microcontroller, which has GPIO pins to build and control a circuit and also supports Bluetooth LE. The GPIO pins are used to control a pump. The communication takes place via Bluetooth LE and the GATT protocol used here.<br>
Programming was done using the Arduino IDE along with the 'ESP32 Wrower Module' as it provided easy access to compile and upload the program code, but also allowed easy communication via the Serial Monitor.
***

## Usage
### GATT protocol
After uploading the program code, the following output appears in the Serial Monitor:
```
Waiting a client connection to notify...
...
____________________________________________________________________
WiFi MAC address of ESP32:	C8:C9:A3:D8:CF:20
BLE MAC address of ESP32:	C8:C9:A3:D8:CF:22
Service UUID:		        c9c0ba7c-72e1-11ed-a1eb-0242ac120002
Characteristic UUID RX:		2e48ebbe-72e6-11ed-a1eb-0242ac120002
Characteristic UUID TX:		35dd80c4-72e6-11ed-a1eb-0242ac120002
### GATT server
gatt://<MAC>/<service>/<characteristic>
____________________________________________________________________
```
This information provides information about the MAC address used, the service UUID and the two characteristics UUIDs. These values are combined, which allows the ESP32 module to be addressed directly via Bluetooth LE and an associated Thing Description.

### Connection via Apps
After the program code has been uploaded, the ESP32 module is waiting to connect. Using an app like 'nRF Connect' or 'LightBlue' you can find the device under the name 'ESP32_ble'. After a connection is established you can then decide which characteristic, i.e. which channel you want to open for communication (tx/rx). That means, either you receive messages or you send them directly to the module.

#### Notes
In the test folder you see test.cpp. This program should make it possible to control a connection using BLE only. No pump and no circuit must be integrated here. If a PUSH command is to change the status, the built-in LED lights up for this.
