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
MAC address of ESP32:		C8:C9:A3:D8:CF:20
Service UUID:			c9c0ba7c-72e1-11ed-a1eb-0242ac120002
Characteristic UUID RX:		2e48ebbe-72e6-11ed-a1eb-0242ac120002
Characteristic UUID TX:		35dd80c4-72e6-11ed-a1eb-0242ac120002
### GATT server
gatt://<MAC>/<service>/<characteristic>
____________________________________________________________________
```
This information provides information about the MAC address used, the service UUID and the two characteristics UUIDs. These values are combined, which allows the ESP32 module to be addressed directly via Bluetooth LE and an associated Thing Description.

### Connection via Apps
After the program code has been uploaded, the ESP32 module is waiting to connect. Using an app like 'nRF Connect' or 'LightBlue' you can find the device under the name 'ESP32_ble'. After a connection is established you can then decide which characteristic, i.e. which channel you want to open for communication (tx/rx). That means, either you receive messages or you send them directly to the module.

## TODO
The code is still based on the function to control the internal LED light of the ESP32 module. As soon as a Bluetooth LE connection is established, the values 'led_on' and 'led_off' can be passed as parameters.
- [ ] Simply True or False should be enough here respectively 1 and 0.

It is also possible to receive values from the ESP32 module. This is done via the Serial Monitor in the Arduino IDE.
- [ ] This function could be deactivated if necessary. Actually, we only need write access.

A sketch of the circuit diagram can also be inserted here in the folder. A circuit diagram that includes the integration of the pump, the Arduino Relay Board & Co.
- [ ] Sketch of circuit diagram (+pump & Co.)
