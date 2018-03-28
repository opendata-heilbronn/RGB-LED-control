# RGB-LED-control
This project is about a multi-controller RGB Strip installation.

It uses the following components:
- Raspberry Pi as Server
- multiple controllers based on the ESP8266 (using MOSFETs to control the RGB Strip) 


Software overview:
- Raspberry Pi running some sort of (e.g.) nodeJS script running a webserver (for controlling the LEDs) and MQTT to coordinate the ESP8266 controllers
- ESP8266 running a simple™ MQTT client which receives the control signals and uses them to control the LED strip(s)

Compatible with both ArduinoIDE and PlatformIO. The necessary libraries are included in the sketches and don't need to be installed externally. (Except ESP8266 for ArduinoIDE)

## Installation
- Install nodeJS
- `npm install -g pm2`
- `cd /opt && git clone https://github.com/opendata-heilbronn/RGB-LED-control`
- Put the following line into crontab (`crontab -e`):  
  `@reboot cd /opt/RGB-LED-control/server/ && /usr/bin/pm2 -o /dev/null start app.js --watch && cd /opt/RGB-LED-control/web/ && /usr/bin/pm2 -o /dev/null start npm --name "rgb-led-web" --watch -- start`

## Adding new node
- add MAC to devices array in server/RGB_control.js
- (optionally) add device group to sets array
  - in `web/src/js/components/DeviceControl.jsx` add device group to `getMenuItems()`