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

#include "config.h" //set your SSID and pass here



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
  domain + "/data/" + thisMAC
};
const unsigned char subscriptions_length = sizeof(subscriptions)/sizeof(subscriptions[0]);


void registration()
{
  mqttClient.publish("RGB-LED-control/registration", thisMAC.c_str());
}

void setRGB(String rgb)
{
  Serial.println("Setting RGB " + rgb);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("[");
  Serial.print(topic);
  Serial.print("] ");
  String data = "";
  for (int i = 0; i < length; i++)
  {
    data += (char)payload[i];
  }
  Serial.println(data);
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
        Serial.print("Subscribing to: ");
        Serial.println(subscriptions[i]);
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
