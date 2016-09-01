/*
 * Created by Leandro Späth ©2016
 * Sources:
 * - https://github.com/esp8266/Arduino
 * - https://github.com/knolleary/pubsubclient
 *
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <sstream>

#include "config.h" //set your SSID and pass here

#define DEBUG false //debug output

const uint8_t r1Pin = D1,
              g1Pin = D2,
              b1Pin = D3;

//const uint8_t ledPins[] = {r1Pin, g1Pin, b1Pin};

WiFiClient espClient;
PubSubClient mqttClient(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;
String thisMAC = WiFi.macAddress();
String clientID = "RGB_controller_" + thisMAC;

String domain = "RGB-LED-control";


String subscriptions[] = {
  domain + "/keepalive",
  domain + "/data/RGB/" + thisMAC
};
const unsigned char subscriptions_length = sizeof(subscriptions)/sizeof(subscriptions[0]);


void registration()
{
  mqttClient.publish("RGB-LED-control/registration", thisMAC.c_str());
}


void setRGB(String rgb)
{
  Serial.println("Setting RGB " + rgb);

  // Get rid of '#' and convert it to integer
  int number = (int) strtol( &rgb[1], NULL, 16);
  Serial.println(number);

  // Split them up into r, g, b values
  int r = number >> 16;
  int g = number >> 8 & 0xFF;
  int b = number & 0xFF;
  analogWrite(r1Pin, r * 4);
  analogWrite(g1Pin, g * 4);
  analogWrite(b1Pin, b * 4);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String data = "";
  for (int i = 0; i < length; i++)
  {
    data += (char)payload[i];
  }
  #if DEBUG
    Serial.print("[");
    Serial.print(topic);
    Serial.print("] ");
    Serial.println(data);
  #endif

  if (String(topic) == subscriptions[0])
  {
    mqttClient.publish(String(domain + "/ack/" + thisMAC).c_str(), "ack");
  }
  else if (String(topic) == subscriptions[1])
  {
    setRGB(data);
  }

  mqttClient.loop();
}


void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(199);
    Serial.print(".");
    digitalWrite(BUILTIN_LED, LOW);
    delay(1);
    digitalWrite(BUILTIN_LED, HIGH);
  }
  digitalWrite(BUILTIN_LED, HIGH);
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}



void mqttReconnect() {
  // Loop until we're reconnected
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (mqttClient.connect(clientID.c_str())) {
      Serial.println("connected");
      for (int i = 0; i < subscriptions_length; i++ )
      {
        mqttClient.subscribe(subscriptions[i].c_str());
        #if DEBUG
          Serial.print("Subscribing to: ");
          Serial.println(subscriptions[i]);
        #endif
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  digitalWrite(BUILTIN_LED, HIGH);

  pinMode(r1Pin, OUTPUT);
  pinMode(g1Pin, OUTPUT);
  pinMode(b1Pin, OUTPUT);
  analogWriteFreq(200);
  Serial.begin(115200);
  setup_wifi();
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback(callback);
  mqttReconnect();
  registration();
}


void loop() {

  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  mqttClient.loop();
}
