const sounds = {
    'w':'crashcymbal',
    'a':'tomhigh',
    's':'hithatclosed',
    'd':'snare',
    'j':'tommid',
    'k':'tomfloor',
    'l':'ride',
    ' ': 'kickdrum'
};



//click listerner
document.querySelectorAll('.drum').forEach(drum=>{
    drum.addEventListener('click', function(){
        const key = this.getAttribute('data-key');
        playSound(key);
        animateDrum(this);
    });
});

//keyboard press listener
document.addEventListener('keydown', function(e){
    const key = e.key.toLowerCase();
    if(sounds[key]){
        const drum = document.querySelector(`[data-key="${key}"]`);
        playSound(key);
        animateDrum(drum);
    }
});

function playSound(key){
    const soundName = sounds[key];
    const audio = new Audio(`sounds/${soundName}.wav`);
    audio.currentTime = 0;
    audio.play();
}
function animateDrum(drum){
    drum.style.transform = 'scale(0.9)';
    drum.style.filter = 'brightness(1.3)';
    setTimeout(()=>{
        drum.style.transform = 'scale(1)';
        drum.style.filter = 'brightness(1)';
    }, 100);
}