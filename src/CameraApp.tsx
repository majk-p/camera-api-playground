import './App.css';
import React, { useCallback, useState, VideoHTMLAttributes } from 'react';

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

function shutdownMediaStream(ms: MediaStream) {
  ms.getTracks().forEach(t => {
    t.stop();
    ms.removeTrack(t);
  });
}

const devicesAndCameraPromise = Promise.all([
  listDevices,
  getDefaultCamera()
]);

interface CameraAppProps {}
interface CameraAppState {
  deviceButtons: JSX.Element[];
  videoStream: MediaStream | undefined
}

class CameraApp extends React.Component<CameraAppProps, CameraAppState> {
  constructor(props: CameraAppProps) {
    super(props);
    this.state = {
      deviceButtons: [],
      videoStream: undefined
    };

    devicesAndCameraPromise.then(([devicesList, media]) => {
      this.setState({
        deviceButtons: this.generateCameraButtons(devicesList),
        videoStream: media
      })
    })
  }

  selectDevice(device: SelectedDevice) {
    if (this.state.videoStream) {
      shutdownMediaStream(this.state.videoStream);
      this.setState({
        ...this.state,
        videoStream: undefined
      });
    }
    if (device == "default") {
      getDefaultCamera().then(stream => {
        this.setState({
          ...this.state,
          videoStream: stream
        });
      })
    } else {
      getCameraById(device.deviceId).then(stream => {
        this.setState({
          ...this.state,
          videoStream: stream
        });
      }).catch(error => alert(`Failed to load camera due to: ${error}`))
    }
  }


  mediaDeviceButtons = (mediaDevice: MediaDeviceInfo) => {
    const name = `${mediaDevice.deviceId} - ${mediaDevice.kind} - ${mediaDevice.label}`
    return (<><button key={mediaDevice.deviceId} onClick={() => this.selectDevice(mediaDevice)}>{name}</button><br /></>)
  }

  generateCameraButtons = (devicesList: MediaDeviceInfo[]) => {
    let buttons = devicesList.filter(device => device.kind == "videoinput").map(this.mediaDeviceButtons)
    buttons.push(<button key="default-device" onClick={() => this.selectDevice("default")}>Default</button>)
    return buttons
  }

  render() {
    return (
      <div className="App">
        Available media devices:<br />
        {this.state.deviceButtons}
        <hr />
        <Video autoPlay srcObject={this.state.videoStream}></Video>
      </div>
    );
  }
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

export default CameraApp;
