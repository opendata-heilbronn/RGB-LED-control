# RGB-LED-control
This project is about a multi-controller RGB Strip installation.

It uses the following components:
- Raspberry Pi as Server
- multiple controllers based on the ESP8266 (using MOSFETs to control the RGB Strip) 


Software overview:
- Raspberry Pi running some sort of (e.g.) nodeJS script running a webserver (for controlling the LEDs) and MQTT to coordinate the ESP8266 controllers
- ESP8266 running a simple™ MQTT client which receives the control signals and uses them to control the LED strip(s)

