document.addEventListener('DOMContentLoaded',()=>{

    //initializing audio context
    let audioContext;
    let isPlaying = false;
    let tempo = 120;
    let nextNoteTime = 0.0;
    let lookAhead = 25.0;
    let scheduleAheadTime = 0.1;

    let clickBuffer;
    let timerID;

    let currentBeat = 1;
    let beatsPerMeasure = 4;

    //getting elements
    const playButton = document.getElementById("play-button");
    const buttonText = document.getElementById("button-text");
    const tempoSlider = document.getElementById("tempo-slider");
    const tempoInput = document.getElementById("tempo-input");
    const timeSignature = document.getElementById("time-signature");
    const bpmDisplay = document.getElementById("bpm-display");

    //function to load audio file
    async function loadClickSound(url){
        try{
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            clickBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }catch(error){
            console.error("Error loading audio file", error);
        }
    }

    async function initAudioContext(){
        if(!audioContext){
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await loadClickSound('sounds/click.wav');

            if(audioContext.state === 'suspended'){
                audioContext.resume();
            }
        }
    }

    //create a source for metronome sound
    function playTick(time){
        if(!clickBuffer) return; 

        const source = audioContext.createBufferSource();
        source.buffer = clickBuffer;

        const gainNode = audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(time);

        gainNode.gain.setValueAtTime(1, time);
        gainNode.gain.linearRampToValueAtTime(0.001, time + 0.03);
    }

    //scheduler function
    function scheduler(){
        while(nextNoteTime < audioContext.currentTime + scheduleAheadTime){
            playTick(nextNoteTime);
            nextNote();
        }
    }

    function nextNote(){
        const secondsPerBeat = 60.0 / tempo;
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

    //start and stop metronome
    function startStopMetronome(){
        initAudioContext().then(()=> {
            if(isPlaying){
                isPlaying = false;
                clearInterval(timerID);
                buttonText.textContent = "▶ Start";
                nextNoteTime = audioContext.currentTime;
                console.log("Metronome Stopped");
            }else{
                isPlaying = true;
                currentBeat = 1; // FIXED: Reset beat
                nextNoteTime = audioContext.currentTime;
                timerID = setInterval(scheduler, lookAhead);
                buttonText.textContent = "⏸ Pause";
                console.log("Metronome Playing");
            }
        });
    }

    //event listeners
    playButton.addEventListener('click', startStopMetronome);

    document.getElementById('change-tempo').addEventListener('input', (event)=>{
        updateTempo(event.target.value); // FIXED: was "targe"
    });

    tempoSlider.addEventListener('input', (event)=>{
        updateTempo(event.target.value);
    });

    timeSignature.addEventListener('change', ()=>{
        beatsPerMeasure = parseInt(timeSignature.value);
        currentBeat = 1;
        console.log(`Time signature changed to ${beatsPerMeasure}/4`);
    });

    tempoInput.addEventListener('blur', (e) => {
        if (e.target.value < 40 || e.target.value > 240 || !e.target.value) {
            updateTempo(120);
        }
    });

    // Initialize
    updateTempo(120);
});