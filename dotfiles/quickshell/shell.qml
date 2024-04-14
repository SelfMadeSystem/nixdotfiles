import Quickshell // for ShellRoot and PanelWindow
import QtQuick // for Text
import Quickshell.Wayland // for WlrLayershell

ShellRoot {
    PanelWindow {
        WlrLayershell.layer: WlrLayer.Background

        anchors {
            top: true
            left: true
            right: true
            bottom: true
        }

        color: "transparent"

        Rectangle {
            anchors.fill: parent
            color: "transparent"
            AnimatedImage {
                id: img
                source: "./hollow.jpg"
                fillMode: Image.PreserveAspectCrop
                anchors.fill: parent
                visible: false
                mipmap: true
            }
            ShaderEffect {
                id: shader
                anchors.fill: parent
                property vector2d resolution: Qt.vector2d(width, height)
                property real time: 0
                property variant source: img
                FrameAnimation {
                    running: true
                    onTriggered: {
                        shader.time = this.elapsedTime;
                    }
                }
                vertexShader: "default.vert.qsb"
                fragmentShader: "Raining.frag.qsb"
            }
        }
    }
}
