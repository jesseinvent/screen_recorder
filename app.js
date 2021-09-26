
window.addEventListener('DOMContentLoaded', () => {

    const startRecordElement = document.querySelector('#startRecording')
    const stopRecordElement = document.querySelector('#stopRecording')
    const video = document.querySelector('#video')
    const audioSupport = document.querySelector('#audioSupport')
    let audioStream = null
    let videoStream = null

    // const logElement = document.querySelector('#log');

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
            type: 'video/webm',
        })

        let filename = window.prompt('Please enter file name')

        // Create anchor element to link and download file
        anchorElement = document.createElement('a')
        anchorElement.href = URL.createObjectURL(blob) // Recorded stream file
        anchorElement.download = `${filename}.webm`

        document.body.appendChild(anchorElement)
        anchorElement.click()

        URL.revokeObjectURL(blob)

        // Remove anchor element
        document.body.removeChild(anchorElement)

    }

    const createRecorder = (streams) => {
         
        let recordedChunks = []
        let combinedStream

        if (audioStream) {
             combinedStream = new MediaStream([...videoStream.getTracks(), ...audioStream.getTracks()])
        } else {
            combinedStream = new MediaStream([...videoStream.getTracks()])
        }

        const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: "video/webm",
        })

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data)
            }
        }

        mediaRecorder.onstop = () => {
            if (confirm('Would you like to save this recording?')){
                saveFile(recordedChunks)
            } 
            
            elementsInitialState()
            
            recordedChunks = []
        }

        // Store stream data in chunk every 200ms
        mediaRecorder.start(200)

        return mediaRecorder;
    }
    
    const startCapture = async (options = {}) => {

        try {

            videoStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            })

            if (audioSupport.checked === true) {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true
                    }
                })
            }

            video.srcObject = videoStream;

            // dumpOptionsInfo()

            recordingInProgressState()
            
            return true

        } catch (error) {
            console.error(error);
        }

    }

    const stopCapture = () => {

        let tracks = video.srcObject.getTracks()

        tracks.forEach( track => track.stop())
        videoStream.getTracks().forEach(track => track.stop())

        if(audioStream) audioStream.getTracks().forEach(track => track.stop())

        video.srcObject = null
    }


    // Event Listeners
    startRecordElement.addEventListener('click', async (e) => {

        if (!navigator.mediaDevices) {
            return alert('Your browser does not support this feature 😔, please use a broswer on a PC or upgrade your browser 🙂')  
        }

       await startCapture()
       createRecorder()
    })

    stopRecordElement.addEventListener('click', (e) => {
        stopCapture()
    })
})
