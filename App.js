import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { useCameraDevices, Camera, useFrameProcessor } from 'react-native-vision-camera';
import { labelImage } from "vision-camera-image-labeler";
import { runOnJS } from 'react-native-reanimated';


function App() {
  const [items, setItems] = useState("null")
  
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

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const labels = labelImage(frame);
    let items="";
    for(let x of labels){
      items+=x.label 
      items +=", "
    }
    items.substr(0, items.length - 2);
console.log(items)
    runOnJS(setItems)(items)
    
  },[]);


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
  const device1= devices.back
  const [camera, setCamera]= useState(0)
  if (device == null && device1 == null) return (
    <View>
      <Text>No detect camera</Text>
      <Button title="Display Notification" onPress={() => onDisplayNotification()} />
      
    </View>
  );
  const changeCamera=()=>{
    setCamera((camera+1)%2)
  }
  
  return (
    <ScrollView>


      <View style={[styles.container, {flexDirection: "column"}]}>
     
        <Button title="Display Notification" onPress={() => onDisplayNotification()} />
        <Button 
          title='Change Camera' 
          onPress={changeCamera}
        />
        <Text style={{fontSize:20}}>{items}</Text>

        <View style={{top: 50}}>
          {camera==0 && 
            <Camera
              style={styles.camera}
              device={device}
              isActive={true}
              frameProcessor={frameProcessor}
              frameProcessorFps={1}
            />
          }
          {camera==1 && 
            <Camera
              style={styles.camera}
              device={device1}
              isActive={true}
              frameProcessor={frameProcessor}
              frameProcessorFps={1}
            />
          }
        </View>
       
      </View>

     
    </ScrollView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    height: 800,
    padding: 20,
    
  },
  camera: {
    ...StyleSheet.absoluteFill,
    
    height: 400,
  
  },
})

export default App;