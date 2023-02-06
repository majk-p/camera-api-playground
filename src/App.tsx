import './App.css';
import React, { useCallback, useState, useMemo, VideoHTMLAttributes } from 'react';

type SelectedDevice = MediaDeviceInfo | "default"

const listDevices = window.navigator.mediaDevices.enumerateDevices();

function getDefaultCamera() {
  return window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "environment" }
  })
}

function getCameraById(deviceId: string) {
  return window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { deviceId: deviceId }
  })
}
const devicesAndCameraPromise = Promise.all([
  listDevices,
  getDefaultCamera()
]);

function App() {
  const [devices, setDevices] = useState<JSX.Element[]>();
  const [videoStream, setVideoStream] = useState<MediaStream>();


  function mediaDeviceButtons(mediaDevice: MediaDeviceInfo) {
    const name = `${mediaDevice.deviceId} - ${mediaDevice.kind} - ${mediaDevice.label}` 
    return (<><button key={mediaDevice.deviceId} onClick={() => selectDevice(mediaDevice)}>{name}</button><br /></>)
  }

  function generateCameraButtons(devicesList: MediaDeviceInfo[]) {
    let buttons = devicesList.filter(device => device.kind == "videoinput").map(mediaDeviceButtons)
    buttons.push(<button key="default-device" onClick={() => selectDevice("default")}>Default</button>)
    return buttons
  }

  function selectDevice(device: SelectedDevice) {
    alert("selecting new device:"+ JSON.stringify(device))
    if(videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(undefined);
    }
    if(device == "default") {
      getDefaultCamera().then(stream => {alert("default camera acquired"); setVideoStream(stream); })
    } else {
      getCameraById(device.deviceId).then(stream => { alert(`device ${device.deviceId} acquired`); setVideoStream(stream); })
    }
  }

  devicesAndCameraPromise.then(([devicesList, media]) => {
    if (!devices) setDevices(generateCameraButtons(devicesList))
    if (!videoStream) setVideoStream(media)
  })
  
  return (
    <div className="App">
      Available media devices:<br/>
      {devices}
      <hr/>
      <Video autoPlay srcObject={videoStream}></Video>
    </div>
  );
}

// hack for displaying video from https://github.com/facebook/react/issues/11163#issuecomment-856054868
type VideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream | undefined;
};

export const Video = ({ srcObject, ...props }: VideoProps) => {
  const refVideo = useCallback(
    (node: HTMLVideoElement) => {
      if (node && srcObject) node.srcObject = srcObject;
    },
    [srcObject],
  );

  return <video ref={refVideo} {...props} />;
};

export default App;
