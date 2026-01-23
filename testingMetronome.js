//initializing audio context
let audioContext;
let isPlaying = false;
let tempo = '';
let nextNoteTime = 0.0;
let lookAhead = 25.0 // this is for how frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // how far ahead to schedule audio (sec)

let clickBuffer;
let timerID;


let currentBeat = 1;
let beatsPerMeasure = 4;


//getting sabaiko id
const playButton = document.getElementById("play-button");
const buttonText = document.getElementById("button-text");
const tempoSlider = document.getElementById("tempo-slider");
const tempoInput = document.getElementById("tempo-input");
const timeSignature = document.getElementById("time-signature");
const pulseIndicator = document.getElementById("pulse-indicator");
const bpmDisplay = document.getElementById("bpm-display");



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



//create a source for metronome sound tiktik
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

//function to update tempo
function updateTempo(value){
    value = Math.max(40, Math.min(240, parseInt(value) || 120));
    tempo = value;
    tempoSlider.value = value;
    tempoInput.value = value;
    bpmDisplay.textContent = value;
    console.log(`Tempo changed to ${tempo} BPM`);
}

function updateBeatIndicators(){
    beatsPerMeasure = parseInt(timeSignature.value);
    beatsIndicators.innerHTML = '';
    for(let i =0; i<beatsPerMeasure; i++){
        const indicator = document.createElement('div');
        indicator.className = 'w-3 h-3 rounded-full bg-slate-600 transition-all duration-100';
        indicator.id = `indicators=${i}`;
        beatsIndicators.appendChild(indicator); 
    }
}

//paybutton
playButton.addEventListener('click', startStopMetronome);

document.getElementById('change-tempo').addEventListener('input',(event)=>{
    updateTempo(event.targe.value);
});

tempoSlider.addEventListener('input', (event)=>{
    updateTempo(event.target.value);
});

timeSignature.addEventListener('change',()=>{
    updateBeatIndicators();
    currentBeat = 1;
    beatCount.textContent = '1';
});



//start and stop metronome
function startStopMetronome(){
    initAudioContext().then(()=> {
         if(isPlaying){
        isPlaying = false;
        clearInterval(timerID);//stop the loop

        buttonText.textContent = "Start";

        //reset nextnotetime to current time so it starts on time on next play
        nextNoteTime = audioContext.currentTime;
        console.log("Metronome Stopped");
    }else{
        isPlaying = true;
        nextNoteTime = audioContext.currentTime;
        timerID = setInterval(scheduler,lookAhead); //start the scheduling loop
        buttonText.textContent = "Pause";
        console.log("Metronome Playing");
    }
    });

   
}


