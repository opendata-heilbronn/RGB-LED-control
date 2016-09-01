/*
 * Created by Leandro Späth ©2016
 * Sources:
 * - https://github.com/esp8266/Arduino
 * - https://github.com/knolleary/pubsubclient
 *  TODO 10bit / 8 bit gamma table (for more accurate PWM)
 * asdf
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>
#include <sstream>

#include "gammaTable.h"
#include "config.h" //set your SSID and pass here

#define DEBUG false //debug output
String Version = "v0.0.1";

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
  domain + "/data/RGB/" + thisMAC,
  domain + "/data/fade/" + thisMAC
};
const unsigned char subscriptions_length = sizeof(subscriptions)/sizeof(subscriptions[0]);

int r1, g1, b1;
unsigned long fadeRcvTime, lastFadePWMMillis=0;
int curRGB[] = {0, 0, 0},
     wasRGB[3],
     toRGB[3];
int fadeTime = 0;

void registration()
{
  String regString = thisMAC;
  regString += ";" + Version;
  mqttClient.publish("RGB-LED-control/registration", regString.c_str());
}


void parseRGB(String rgb)
{
  // Get rid of '#' and convert it to integer
  int number = (int) strtol( &rgb[1], NULL, 16);
  //Serial.println(number);

  // Split them up into r, g, b values
  r1 = number >> 16;
  g1 = number >> 8 & 0xFF;
  b1 = number & 0xFF;
  curRGB[0] = r1;
  curRGB[1] = g1;
  curRGB[2] = b1;
}

int tmpLast = 0;
void setParsedRGB()
{
  //analogWrite(r1Pin, gamma8[curRGB[0]] * 4);
  analogWrite(r1Pin, gamma10[curRGB[0]]);
  analogWrite(g1Pin, gamma10[curRGB[1]]);
  analogWrite(b1Pin, gamma10[curRGB[2]]);
}

void parseFade(String fadeStr) //example fadeString: "#123456;500"
{
  fadeRcvTime = millis();
  memcpy(wasRGB, curRGB, sizeof(curRGB));
  String rgb = fadeStr.substring(0, 7);
  parseRGB(rgb);
  memcpy(toRGB, curRGB, sizeof(curRGB));
  String fadeTimeStr = fadeStr.substring(fadeStr.indexOf(";")+1);
  fadeTime = fadeTimeStr.toInt();
  #if DEBUG
    Serial.print("fading to " + rgb + " in " + fadeTime + " ms");
  #endif
}

void fadeLoop()
{
  if(millis() - fadeRcvTime <= fadeTime)
  {
    if(millis() - lastFadePWMMillis >= 1) //run every ms
    {
      lastFadePWMMillis = millis();
      for(int i = 0; i < 3; ++i)
      {
        int colDiff = toRGB[i] - wasRGB[i];
        int timeDiff = millis() - fadeRcvTime;
        float fadeProgress = ((float)timeDiff / fadeTime);
        curRGB[i] = wasRGB[i] + fadeProgress * colDiff; //set currentRGB value based on progress of fade
      }
      setParsedRGB();
    }
  }
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
    parseRGB(data);
    setParsedRGB();
    #if DEBUG
      Serial.println("Setting RGB " + data);
    #endif
  }
  else if (String(topic) == subscriptions[2])
  {
    parseFade(data);
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
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC adress: ");
  Serial.println(thisMAC);
  Serial.println("Version " + Version);
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

void setupOTA()
{
  // Port defaults to 8266
  ArduinoOTA.setPort(8266);

  // Hostname defaults to MAC address
  ArduinoOTA.setHostname(("RGB-ESP " + WiFi.macAddress()).c_str());

  // No authentication by default
  ArduinoOTA.setPassword(OTA_pass);

  ArduinoOTA.onStart([]() {
    Serial.println("[OTA] Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\n[OTA] End");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("[OTA] Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("[OTA] Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("[OTA] Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("[OTA] Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("[OTA] Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("[OTA] Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("[OTA] End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("[OTA] ready");
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
  setupOTA();
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback(callback);
  mqttReconnect();
  registration();
}


void loop() {
  ArduinoOTA.handle();
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  mqttClient.loop();
  fadeLoop();
}
