import React, { useEffect, useState } from 'react';
import { Alert, Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { useCameraDevices, Camera, useFrameProcessor } from 'react-native-vision-camera';

function App() {
  useEffect(() => {
    requestPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage =>{
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage))
      DisplayNotification(remoteMessage);
    });

    return unsubscribe
  });

  useEffect(()=>{
    getDevices();
  })
  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet'
  //   const isHotdog = detectIsHotdog(frame)
  //   console.log(isHotdog ? "Hotdog!" : "Not Hotdog.")
  // }, [])

  const requestPermission = async()=>{
    const authStatus = await messaging().requestPermission()
    const cameraPermission = await Camera.getCameraPermissionStatus()
    console.log(cameraPermission)
  }

  async function DisplayNotification(remoteMessage){
    const channelId = await notifee.createChannel({
      id: 'ch1',
      name: 'channel 1',
    })
    console.log (remoteMessage.notification.title,remoteMessage.notification.body)

    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId,
      }
    })
  }

  async function getDevices(){
    const devices = await Camera.getAvailableCameraDevices()
    //console.log(devices)
  }

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    console.log("onDisplayNotification")

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
      },
    });
  }
  const devices = useCameraDevices()
  const device = devices.front
  console.log(device)

  if (device == null) return (
    <View>
      <Text>No detect camera</Text>
      <Button title="Display Notification" onPress={() => onDisplayNotification()} />
      
    </View>
  );
  
  return (
    <ScrollView>

    
      <View style={[styles.container, {flexDirection: "column"}]}>
        <Text>camera</Text>
        <Button title="Display Notification" onPress={() => onDisplayNotification()} />
      
        <View style={{marginTop: 100}}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          // frameProcessor={frameProcessor}
        />
        </View>
      </View>
      
     
    </ScrollView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    height: 500,
    padding: 20,
    
  },
  camera: {
    ...StyleSheet.absoluteFill,
 
    height: 400,
  
  },
})

export default App;