let player;
let isPlaying = false;
let isCakeCut = false;
const popSound = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
popSound.volume = 0.5;
let lastShayariIndex = -1;

function speakText(text, onEndCallback) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        utterance.onend = function() {
            if (onEndCallback) onEndCallback();
        };
        window.speechSynthesis.speak(utterance);
    } else {
        if (onEndCallback) onEndCallback();
    }
}

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '1',
        width: '1',
        videoId: '6rbNqft5U50', 
        playerVars: {
            'autoplay': 0,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log("YouTube Player is ready.");
    
    // Custom loop to remove the silent end part
    setInterval(() => {
        if (isPlaying && player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
            let duration = player.getDuration();
            let currentTime = player.getCurrentTime();
            // Cut off the last 2 seconds of the video to avoid silence
            if (duration > 0 && currentTime >= (duration - 2)) {
                player.seekTo(0);
            }
        }
    }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
    // Focus the input field when the page loads
    const inputField = document.getElementById('name-input');
    if (inputField) {
        inputField.focus();
    }
    
    const enterBtn = document.getElementById('enter-btn');
    const nameInput = document.getElementById('name-input');
    const inputScreen = document.getElementById('input-screen');
    const celebrationScreen = document.getElementById('celebration-screen');
    const bdayName = document.getElementById('bday-name');
    const cakeContainer = document.getElementById('cake-container');
    const candles = document.querySelectorAll('.flame');
    const musicBtn = document.getElementById('music-btn');
    const shayariBtn = document.getElementById('shayari-btn');
    const modal = document.getElementById('shayari-modal');
    const closeBtn = document.querySelector('.close-btn');
    const shayariName = document.getElementById('shayari-name');
    const shayariText = document.getElementById('shayari-text');

    // Handle Enter input via Keyboard as well
    nameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            enterBtn.click();
        }
    });

    enterBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) {
            bdayName.innerHTML = '';
            name.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'anim-letter';
                if (char === ' ') span.innerHTML = '&nbsp;';
                // Staggered animation delay for each letter
                span.style.animationDelay = `${i * 0.15}s`;
                bdayName.appendChild(span);
            });
            inputScreen.classList.remove('active');
            
            const countdownScreen = document.getElementById('countdown-screen');
            const countdownNumber = document.getElementById('countdown-number');
            countdownScreen.classList.add('active');
            
            let count = 3;
            countdownNumber.textContent = count;
            const numberWords = { 1: "One", 2: "Two", 3: "Three" };
            speakText(numberWords[count]);
            
            const countInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownNumber.textContent = count;
                    speakText(numberWords[count]);
                } else {
                    clearInterval(countInterval);
                    countdownScreen.classList.remove('active');
                    celebrationScreen.classList.add('active');
                    
                    // Start Music in low volume
                    if (player && typeof player.playVideo === 'function') {
                        player.setVolume(20);
                        player.playVideo();
                        isPlaying = true;
                        musicBtn.innerHTML = '🔊 Stop Music';
                        document.querySelector('.bunting-container')?.classList.add('music-beat');
                        document.querySelector('.cute-cake-container')?.classList.add('music-beat');
                    }
                    
                    // Speak Happy Birthday
                    speakText(`Happy birthday ${name}`, () => {
                        // Restore volume
                        if (player && typeof player.setVolume === 'function') {
                            player.setVolume(100);
                        }
                    });
                    
                    createBalloons();
                    // Automatically trigger the big confetti burst now that there is no cake to click
                    fireworkConfetti();
                }
            }, 1000);
        } else {
            // Shake animation for empty input
            nameInput.style.transform = 'translateX(-10px)';
            setTimeout(() => nameInput.style.transform = 'translateX(10px)', 100);
            setTimeout(() => nameInput.style.transform = 'translateX(-10px)', 200);
            setTimeout(() => nameInput.style.transform = 'translateX(0)', 300);
            nameInput.style.borderColor = '#ff4757';
        }
    });

    const cuteCake = document.getElementById('cute-cake');
    let isCakeCut = false;
    
    if (cuteCake) {
        cuteCake.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isCakeCut) {
                // hide flame
                const flame = document.querySelector('.cute-flame');
                if (flame) flame.style.display = 'none';
                
                const instr = document.querySelector('.cute-instruction');
                if (instr) instr.textContent = "Yay! Happy Birthday!";
                
                popSound.currentTime = 0;
                popSound.play().catch(err => console.log(err));
                
                fireworkConfetti();
                
                isCakeCut = true;
            }
        });
    }

    // Allow tapping the screen for extra confetti
    celebrationScreen.addEventListener('click', () => {
        fireworkConfetti();
    });

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
            musicBtn.innerHTML = '🔇 Play Music';
            document.querySelector('.bunting-container')?.classList.remove('music-beat');
            document.querySelector('.cute-cake-container')?.classList.remove('music-beat');
        } else {
            player.playVideo();
            isPlaying = true;
            musicBtn.innerHTML = '🔊 Stop Music';
            document.querySelector('.bunting-container')?.classList.add('music-beat');
            document.querySelector('.cute-cake-container')?.classList.add('music-beat');
        }
    });

    shayariBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const shayaris = [
            `Phoolon ne amrit ka jaam bheja hai, Taaron ne gagan se salam bheja hai, Khushiyan bhari ho zindagi aapki, Yahi dil se humne paigham bheja hai. Happy Birthday ${name}!`,
            `Dua hai ki kamyabi ke har shikhar pe aapka naam hoga, Aapke har kadam par duniya ka salam hoga, Himat se mushkilon ka samana karna ${name}, Hamari dua hai ki waqt bhi ek din aapka gulam hoga.`,
            `Khuda buri nazar se bachaye aapko, Chand sitaron se sajaye aapko, Gham kya hota hai ye aap bhool hi jao, Khuda zindagi me itna hasaye aapko. Janamdin Mubarak ${name}!`,
            `Aap wo phool ho jo gulshan mein nahi khilte, Par jis pe aasmaan ke farishte bhi garv karte hain, Aapki zindagi hadh se zyada keemti hai, Janam din aap hamesha manayein yun hi hanste hanste. Happy Birthday ${name}!`,
            `Ho puri dil ki har khwahish aapki, Aur mile khushiyon ka jahan aapko, Jab agar aap mange aasma ka ek tara, Toh bhagwan dede sara aasmaan aapko. Happy Birthday ${name}!`,
            `Suraj roshni le kar aayaa, Aur chidiyon ne gaanaa gaayaa, Phoolon ne has has kar bolaa, Mubarak ho ${name} tumhara janam din aaya!`,
            `Tohfa-e-dil de doon ya de doon chand sitare, Janam din pe tujhe kya doon ye puche mujhse saare, Zindagi tere naam kar doon toh bhi kam hai, Daman me bhar du har pal khushiyan main tumhare. Happy Birthday ${name}!`,
            `Har raah aasan ho, Har raah pe khushiyan ho, Har din khoobsurat ho, Aisa hi poora jivan ho, Yahi har din meri dua ho. Aisa hi tumhara har janamdin ho ${name}!`,
            `Ugta hua Suraj dua de aapko, Khilta hua phool khushbu de aapko, Hum to kuch dene ke kabil nahi hai, Dene wala hazaar khushiyan de aapko. Happy Birthday ${name}!`,
            `Zindagi ki kuch khas duayein lelo humse, Janamdin par kuch nazrane lelo humse, Bhar de rang jo tere jeevan ke palo mein, Aaj wo pyari mubarak baad lelo humse. Happy Birthday ${name}!`
        ];
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * shayaris.length);
        } while (randomIndex === lastShayariIndex && shayaris.length > 1);
        
        lastShayariIndex = randomIndex;
        
        const selectedShayari = shayaris[randomIndex];
        
        // Lower music volume
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(20);
        }
        
        const originalText = shayariBtn.innerHTML;
        shayariBtn.innerHTML = '🗣️ Speaking...';
        
        speakText(selectedShayari, () => {
            // Restore volume
            if (player && typeof player.setVolume === 'function') {
                player.setVolume(100);
            }
            shayariBtn.innerHTML = originalText;
        });
    });

    function createBalloons() {
        const container = document.getElementById('balloons-container');
        // Bright colorful balloons
        const colors = ['#ff4757', '#1e90ff', '#2ed573', '#ffa502', '#9c88ff', '#ff6b81', '#00d2d3'];
        
        for (let i = 0; i < 12; i++) {
            const balloon = document.createElement('div');
            balloon.classList.add('balloon');
            balloon.style.left = `${Math.random() * 95}vw`; 
            
            const baseColor = colors[Math.random() * colors.length | 0];
            // Apply radial gradient for realistic 3D look with the chosen color
            balloon.style.backgroundColor = baseColor;
            balloon.style.background = `radial-gradient(circle at 30% 30%, #ffffff 0%, ${baseColor} 40%, rgba(0,0,0,0.3) 100%)`;
            
            const scale = 0.8 + Math.random() * 0.5;
            balloon.style.transform = `scale(${scale})`;
            balloon.style.animationDuration = `${5 + Math.random() * 5}s`;
            balloon.style.animationDelay = `${Math.random() * 2}s`;
            
            balloon.addEventListener('click', function(e) {
                e.stopPropagation(); // prevent cake cut trigger
                // Play pop sound
                popSound.currentTime = 0;
                popSound.play().catch(err => console.log(err));
                
                // Blast confetti at click position
                const rect = this.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                
                confetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { x: x, y: y },
                    colors: [baseColor, '#ffffff', '#ffd700'],
                    zIndex: 100
                });
                
                // Remove balloon instantly
                this.remove();
            });
            
            container.appendChild(balloon);
        }
    }

    function startConfetti() {
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    }

    function fireworkConfetti() {
        var count = 250;
        var defaults = {
            origin: { y: 0.7 },
            zIndex: 100
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
});
