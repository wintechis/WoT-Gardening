## Check in terminal if there is a bluetooth device:
```
$ bluetoothctl
> power on
> scan on    // if you find device then...
> scan off
``` 
pair: it's not necessary better use 'connect'
```
> pair C8:C9:A3:D8:CF:22
> connect C8:C9:A3:D8:CF:22
> menu gatt
> select-attribute 2e48ebbe-72e6-11ed-a1eb-0242ac120002
```
write 0x31 for on and 0x30 for off<br>
`> write "0x31"`

show all paired devices:
```
> paired-devices
```
remove paired devices - IMPORTANT!!! - you can't connect more than one device!!!
```
> remove C8:C9:A3:D8:CF:22
> quit
```
