//initializing audio context
let audioContext;
let isPlaying = false;
let tempo = 160;
let nextNoteTime = 0.0;
let lookAhead = 25.0 // this is for how frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // how far ahead to schedule audio (sec)

let clickBuffer;

//function to load audio file
async function loadClickSound(url){
    try{
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        //decoding the audio file
        clickBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }catch(error){
        console.error("Error loading audio file", error);
    }
}

async function initAudioContext(){
    if(!audioContext){
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        await loadClickSound('sounds/click.wav');

        //check if audio context is suspended
        if(audioContext.state === 'suspended'){
            audioContext.resume();
        }
    }
}



//create a oscillator for metronome sound tiktik
function playTick(time){
    if(!clickBuffer) return; 

    //create a source node 
    const source = audioContext.createBufferSource();
    source.buffer = clickBuffer


    const gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);



    //trigger sound
    source.start(time);



   gainNode.gain.setValueAtTime(1,time); //volume at beggining or start line

   gainNode.gain.linearRampToValueAtTime(0.001,time + 0.03);// adding a quick fadeout so it doesnt click for too long


}

//scheduler function
function scheduler(){
    //whiile there are notes that will need to play before the next interval schdeule them in advance
    while(nextNoteTime<audioContext.currentTime + scheduleAheadTime){
        playTick(nextNoteTime);
        nextNote();
    }
}

function nextNote(){
    const secondsPerBeat = 60.0 / tempo; //duration of a beat in seconds which is 60/120 = 0.5s 
    nextNoteTime += secondsPerBeat;
}

let timerID;

//start and stop metronome
function startStopMetronome(){
    initAudioContext().then(()=> {
         if(isPlaying){
        isPlaying = false;
        clearInterval(timerID);//stop the loop

        //reset nextnotetime to current time so it starts on time on next play
        nextNoteTime = audioContext.currentTime;
        console.log("Metronome Stopped");
    }else{
        isPlaying = true;
        nextNoteTime = audioContext.currentTime;
        timerID = setInterval(scheduler,lookAhead); //start the scheduling loop
        console.log("Metronome Playing");
    }
    })

   
}

document.getElementById('play-button').addEventListener('click', startStopMetronome);

document.getElementById('change-tempo').addEventListener('input', (event)=>{
   tempo = event.target.value;
    console.log(`tempo changed to ${tempo} BPM`);
})