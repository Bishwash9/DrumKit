//initializing audio context
let audioContext;
let isPlaying = false;
let tempo = 120;
let nextNoteTime = 0.0;
let lookAhead = 25.0 // this is for how frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // how far ahead to schedule audio (sec)

function initAudioContext(){
    if(!audioContext){
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        //check if audio context is suspended
        if(audioContext.state === 'suspended'){
            audioContext.resume();
        }
    }
}



//create a oscillator for metronome sound tiktik
function playTick(time){
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

   oscillator.type = 'square'; //simple square wave
   oscillator.frequency.setValueAtTime(1000,time); //frequency in hertz
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
    initAudioContext();

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
}

document.getElementById('play-button').addEventListener('click', startStopMetronome);