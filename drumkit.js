const sounds = {
    'w':'crash',
    'a':'tom-high',
    's':'hit-hat',
    'd':'snare',
    'j':'tom-mid',
    'k':'tom-floor',
    'l':'ride',
    ' ': 'space'
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
    console.log('playing sound for key:', sounds[key]);
}
function animateDrum(drum){
    drum.style.transform = 'scale(0.9)';
    drum.style.filter = 'brightness(1.3)';
    setTimeout(()=>{
        drum.style.transform = 'scale(1)';
        drum.style.filter = brightness(1);
    }, 100);
}