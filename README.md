# WoT-Gardening

## Check list: Deliverables
- [ ] Softwareapplication [User Stories](###user-stories)
    - [ ] MIT-license: I can't add any licenses (supervisor?)
- [ ] Installation + Tutorial Guide: it's part of this README
- [ ] Code Documentation
    * generate HTML documents from source code via Doxygen, Sphinx, JavaDoc or JSDoc and store them in '**docs**' folder
- [ ] Promo Video
- [ ] Presentation

### User Stories
- [ ] **MUST** As an operator, I want to access the sensor data from the Xiaomi Flower Care Sensor via BLE and the Web of Things.
- [x] **MUST** As an operator, I want to read and change the status of the pump via BLE and the Web of Things.
- [x] **MUST** As an operator, I want to access a Gateway via HTTP and interact with the BLE devices based on the Web of Things.
- [ ] **SHOULD** As an operator, I want a WoT Gateway that can consume BLE Thing Descriptions and expose converted HTTP Thing Descriptions.
- [ ] **CAN** As an operator, I want to access the device using Read-Write Linked Data.
***

#### Question
- could it be a problem to connect more than one device with RPi via BLE - is there a limit?
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
`GET http://192.168.1.122:8080/status`<br>

Change the state to ON:<br>
`POST http://192.168.1.122:8080/power`<br>
`Type: JSON` ***NOTE: even if JSON is already preset, you have to confirm the 'Type' again to JSON. Otherwise it will not work.***<br>
Name: `value` and Value: `31`<br>

Change state to OFF:<br>
Name : `value` and  Value: `30`<br>

