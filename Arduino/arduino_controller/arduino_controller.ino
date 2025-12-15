// ===== WiFi Libraries =====
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>

// ===== MPU6050 =====
#include <Wire.h>

// ===== WiFi Credentials =====
char ssid[] = "ARRIS-1E9D";
char pass[] = "engine.011.click";

// ===== Server Info =====
char serverAddress[] = "aws-test-jx11.onrender.com";
int port = 80;

// ===== MPU6050 Variables =====
const int MPU = 0x68;

float AccX, AccY, AccZ;
float GyroX, GyroY, GyroZ;
float accAngleX, accAngleY;
float gyroAngleX, gyroAngleY, yaw;
float roll, pitch;

float AccErrorX, AccErrorY;
float GyroErrorX, GyroErrorY, GyroErrorZ;

float elapsedTime, currentTime, previousTime;
int c = 0;

// ===== HC-SR04 Pins =====
const int trigPin = 9;
const int echoPin = 10;
float distance;

// ===== Timing Control =====
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 1000; // 1 second

// =====================================================
void setup() {
  Serial.begin(9600);

  // ===== HC-SR04 Setup =====
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // ===== WiFi Connection =====
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.println("Connecting to WiFi...");
    delay(1000);
  }
  Serial.println("Connected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // ===== MPU6050 Setup =====
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);

  calculate_IMU_error();
  delay(20);
}

// =====================================================
void loop() {
  // Update sensors continuously
  readMPU6050();
  readDistance();

  // Send data once per second
  if (millis() - lastSendTime >= sendInterval) {
    printData();
    sendSensorData();
    lastSendTime = millis();
  }
}

// =====================================================
void readDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  distance = (duration * 0.0343) / 2.0;
}

// =====================================================
void readMPU6050() {
  // Accelerometer
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU, (size_t)6, true);

  AccX = (Wire.read() << 8 | Wire.read()) / 16384.0;
  AccY = (Wire.read() << 8 | Wire.read()) / 16384.0;
  AccZ = (Wire.read() << 8 | Wire.read()) / 16384.0;

  accAngleX = (atan(AccY / sqrt(pow(AccX, 2) + pow(AccZ, 2))) * 180 / PI) - AccErrorX;
  accAngleY = (atan(-AccX / sqrt(pow(AccY, 2) + pow(AccZ, 2))) * 180 / PI) - AccErrorY;

  // Gyroscope
  previousTime = currentTime;
  currentTime = millis();
  elapsedTime = (currentTime - previousTime) / 1000.0;

  Wire.beginTransmission(MPU);
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU, (size_t)6, true);

  GyroX = (Wire.read() << 8 | Wire.read()) / 131.0 + GyroErrorX;
  GyroY = (Wire.read() << 8 | Wire.read()) / 131.0 + GyroErrorY;
  GyroZ = (Wire.read() << 8 | Wire.read()) / 131.0 + GyroErrorZ;

  gyroAngleX += GyroX * elapsedTime;
  gyroAngleY += GyroY * elapsedTime;
  yaw += GyroZ * elapsedTime;

  roll  = 0.96 * gyroAngleX + 0.04 * accAngleX;
  pitch = 0.96 * gyroAngleY + 0.04 * accAngleY;
}

// =====================================================
void sendSensorData() {
  WiFiClient client;
  HttpClient httpClient(client, serverAddress, port);

  String postData =
    "roll=" + String(roll, 2) +
    "&pitch=" + String(pitch, 2) +
    "&yaw=" + String(yaw, 2) +
    "&distance=" + String(distance, 2);

  httpClient.beginRequest();
  httpClient.post("/addtodatabase");
  httpClient.sendHeader("Content-Type", "application/x-www-form-urlencoded");
  httpClient.sendHeader("Content-Length", postData.length());
  httpClient.endRequest();
  httpClient.print(postData);

  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();

  Serial.print("HTTP ");
  Serial.print(statusCode);
  Serial.print(" | ");
  Serial.println(response);

  httpClient.stop();
}

// =====================================================
void printData() {
  Serial.print("Roll: "); Serial.print(roll, 2);
  Serial.print(" | Pitch: "); Serial.print(pitch, 2);
  Serial.print(" | Yaw: "); Serial.print(yaw, 2);
  Serial.print(" | Distance: "); Serial.print(distance, 2);
  Serial.println(" cm");
}

// =====================================================
void calculate_IMU_error() {
  while (c < 200) {
    Wire.beginTransmission(MPU);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU, (size_t)6, true);

    AccX = (Wire.read() << 8 | Wire.read()) / 16384.0;
    AccY = (Wire.read() << 8 | Wire.read()) / 16384.0;
    AccZ = (Wire.read() << 8 | Wire.read()) / 16384.0;

    AccErrorX += atan(AccY / sqrt(pow(AccX, 2) + pow(AccZ, 2))) * 180 / PI;
    AccErrorY += atan(-AccX / sqrt(pow(AccY, 2) + pow(AccZ, 2))) * 180 / PI;
    c++;
  }

  AccErrorX /= 200;
  AccErrorY /= 200;
  c = 0;

  while (c < 200) {
    Wire.beginTransmission(MPU);
    Wire.write(0x43);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU, (size_t)6, true);

    GyroX = Wire.read() << 8 | Wire.read();
    GyroY = Wire.read() << 8 | Wire.read();
    GyroZ = Wire.read() << 8 | Wire.read();

    GyroErrorX += GyroX / 131.0;
    GyroErrorY += GyroY / 131.0;
    GyroErrorZ += GyroZ / 131.0;
    c++;
  }

  GyroErrorX /= 200;
  GyroErrorY /= 200;
  GyroErrorZ /= 200;
}