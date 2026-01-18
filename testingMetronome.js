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



