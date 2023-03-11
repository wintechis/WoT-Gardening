# WoT-Gardening

## Check list: Deliverables
- [x] Softwareapplication [User Stories](###user-stories)
    - [x] MIT-license
- [x] Installation + Tutorial Guide: it's part of this README
- [x] Code Documentation
    * generate HTML documents from source code via Doxygen, Sphinx, JavaDoc or JSDoc and store them in '**docs**' folder
- [x] Promo Video
- [x] Presentation

### User Stories
- [ ] ~~**MUST** As an operator, I want to access the sensor data from the Xiaomi Flower Care Sensor via BLE and the Web of Things.~~
- [x] **MUST** As an operator, I want to read and change the status of the pump via BLE and the Web of Things.
- [x] **MUST** As an operator, I want to access a Gateway via HTTP and interact with the BLE devices based on the Web of Things.
- [ ] ~~**SHOULD** As an operator, I want a WoT Gateway that can consume BLE Thing Descriptions and expose converted HTTP Thing Descriptions.~~
- [ ] ~~**CAN** As an operator, I want to access the device using Read-Write Linked Data.~~
    (Note: Since my partner left the group, the user stores have reduced)
***

## Preconditions
- node v19.1.0
- npm 8.19.3

## Installation
- Download the project
- Install all packages with `npm install`
- Build the project with `npm run build`

## Tutorial
### Prepare ESP32 Module
- Load `main.cpp` from `ble_devices/esp32_pump/src/main.cpp` via Arduino IDE on the esp32 board
- Reboot esp32 board by pressing reboot-button on the board

### Start connection
- Change to the folder src/
- Start the gateway: `node gateway.js`
- Wait until the connection is established

### Use for example the RESTED Add-On on your browser
Get the current state of the esp32 module (pump)<br>
`GET http://<IP>:8080/status`<br>

Change the state to ON:<br>
Request:`POST http://<IP>:8080/power`<br>
***NOTE: even if JSON is already preset, you have to confirm the 'Type' again to JSON. Otherwise it will not work.***<br>
Type: `JSON`<br>
Name: `value`<br>
Value: `1`<br>

Change state to OFF:<br>
Name : `value`<br>
Value: `0`<br>

