
window.addEventListener('DOMContentLoaded', () => {

    const startRecordElement = document.querySelector('#startRecording')
    const stopRecordElement = document.querySelector('#stopRecording')
    const video = document.querySelector('#video')
    const logElement = document.querySelector('#log');

    // const dumpOptionsInfo = () => {

    //     const videoTrack = video.srcObject.getVideoTracks()[0]

    //     console.info("Track settings:")
    //     console.info(JSON.stringify(videoTrack.getSettings(), null, 2))

    //     console.info("Track constraints:")
    //     console.info(JSON.stringify(videoTrack.getConstraints(), null, 2))

    // }

    function elementsInitialState(){
        startRecordElement.classList.replace('recording', 'startBtn')
        stopRecordElement.style.display = 'none'
    }

    function recordingInProgressState () {
        stopRecordElement.style.display = 'inline'
       startRecordElement.classList.replace('startBtn', 'recording')

    }

    const saveFile = (recordedChunks = []) => {

        const blob = new Blob(recordedChunks, {
            type: 'video/mp4'
        })

        let filename = window.prompt('Please enter file name')

        // Create anchor element to link and download file
        anchorElement = document.createElement('a')
        anchorElement.href = URL.createObjectURL(blob) // Recorded mp4 file
        anchorElement.download = `${filename}.mp4`

        document.body.appendChild(anchorElement)
        anchorElement.click()

        URL.revokeObjectURL(blob)

        // Remove anchor element
        document.body.removeChild(anchorElement)

    }

    const createRecorder = (stream) => {
         
        let recordedChunks = []

        const mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data)
            }
        }

        mediaRecorder.onstop = () => {
            if (confirm('Would you like to save this recording?')){
                saveFile(recordedChunks)
            } else {
                elementsInitialState()
            }

            recordedChunks = []
        }

        // Store stream data in chunk every 200ms
        mediaRecorder.start(200)

        return mediaRecorder;
    }
    
    const startCapture = async (options = {}) => {

        try {

            let capturedStream = await navigator.mediaDevices.getDisplayMedia({
                // video: {
                //     cursor: "always"
                // },
                video: true,
                audio: true
                // audio: {
                //     echoCancellation: true
                // }
            })

            video.srcObject = capturedStream;

            // dumpOptionsInfo()
            
            return capturedStream

        } catch (error) {
            console.error(error);
        }

    }

    const stopCapture = () => {

        let tracks = video.srcObject.getTracks()

        console.log(tracks)

        tracks.forEach( track => {
            track.stop()
        })

        video.srcObject = null
    }


    // Event Listeners
    startRecordElement.addEventListener('click', async (e) => {
       let stream = await startCapture()
       recordingInProgressState()
       createRecorder(stream)
    })

    stopRecordElement.addEventListener('click', (e) => {
        stopCapture()
    })
})
