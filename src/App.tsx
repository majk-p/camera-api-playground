import './App.css';
import React, { useCallback, useState, useMemo, VideoHTMLAttributes } from 'react';

type SelectedDevice = MediaDeviceInfo | "default"

function listDevices() {
  return window.navigator.mediaDevices.enumerateDevices()
}

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

function App() {
  const [selectedDevice, setSelectedDevice] = useState<SelectedDevice>("default");
  const [devices, setDevices] = useState<JSX.Element[]>();
  const [videoStream, setVideoStream] = useState<MediaStream>();


  function mediaDeviceButtons(mediaDevice: MediaDeviceInfo) {
    const name = `${mediaDevice.deviceId} - ${mediaDevice.groupId} - ${mediaDevice.kind} - ${mediaDevice.label}` 
    return (<button key={mediaDevice.deviceId} onClick={() => selectDevice(mediaDevice)}>{name}</button>)
  }

  function selectDevice(device: SelectedDevice) {
    if(device == "default") {
      getDefaultCamera().then(setVideoStream)  
    } else {
      getCameraById(device.deviceId).then(setVideoStream)
    }
  }

  Promise.all([
    listDevices(),
    getDefaultCamera()
  ]).then(([devicesList, media]) => {
    if (!devices) setDevices(devicesList.filter(device => device.kind == "videoinput").map(mediaDeviceButtons))
    if (!videoStream) setVideoStream(media)
  })

  const cameraDevices = useMemo(() =>
    <>{devices}</>,
    [devices]
  )

  const videoPlayback = useMemo(() =>
    <Video autoPlay srcObject={videoStream}></Video>,
    [videoStream]
  )
  
  return (
    <div className="App">
      Available media devices:
      {cameraDevices}
      Preview:
      {videoPlayback}
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
