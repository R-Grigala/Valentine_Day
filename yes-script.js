let musicPlaying = false

window.addEventListener('load', () => {
    launchConfetti()

    const music = document.getElementById('bg-music')
    music.volume = 0.3
    music.play().then(() => {
        musicPlaying = true
        syncMusicButton()
    }).catch(() => {
        musicPlaying = false
        syncMusicButton()
    })
})

function syncMusicButton() {
    const music = document.getElementById('bg-music')
    const playing = music && !music.paused
    musicPlaying = playing
    document.getElementById('music-toggle').textContent = playing ? '🔊' : '🔇'
}

function launchConfetti() {
    if (typeof confetti !== 'function') return

    const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ffb3c1', '#ff0000', '#ff6347', '#fff', '#ffdf00']
    const duration = 6000
    const end = Date.now() + duration

    // Initial big burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors
    })

    // Continuous side cannons
    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval)
            return
        }

        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors
        })

        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors
        })
    }, 300)
}

function toggleMusic() {
    const music = document.getElementById('bg-music')
    if (!music.paused) {
        music.pause()
        syncMusicButton()
        return
    }
    music.play().then(syncMusicButton).catch(syncMusicButton)
}
