const gifStages = [
    "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif", // 0 normal
    "https://media.tenor.com/VHKaproGgvQAAAAM/chiikawa-rain-chiikawa.gif", // 1 worried
    "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif", // 2 pleading
    "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif", // 3 sad
    "https://media.tenor.com/q_GHYLfc3_IAAAAM/chiikawa-cry.gif", // 4 sadder
    "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif", // 5 devastated
    "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif", // 6 very devastated
    "https://media.tenor.com/lN9RW8PV7hwAAAAM/chiikawa-cry.gif" // 7 crying runaway
]

const noMessages = [
    "No",
    "Are you positive? 🤔",
    "Pookie please... 🥺",
    "If you say no, I will be really sad...",
    "I will be very sad... 😢",
    "Please??? 💔",
    "Don't do this to me...",
    "Last chance! 😭",
    "You can't catch me anyway 😜"
]

const yesTeasePokes = [
    "try saying no first... I bet you want to know what happens 😏",
    "go on, hit no... just once 👀",
    "you're missing out 😈",
    "click no, I dare you 😏"
]

let yesTeased = false

let noClickCount = 0
let runawayEnabled = false

const catGif = document.getElementById('cat-gif')
const yesBtn = document.getElementById('yes-btn')
const noBtn = document.getElementById('no-btn')
const music = document.getElementById('bg-music')
const musicToggle = document.getElementById('music-toggle')

gifStages.forEach((src) => {
    const preload = new Image()
    preload.src = src
})

function syncMusicButton() {
    const playing = !music.paused && !music.muted
    musicToggle.textContent = playing ? '🔊' : '🔇'
    musicToggle.setAttribute('aria-pressed', playing ? 'true' : 'false')
}

// Autoplay starts muted so the browser allows it, then we unmute.
music.muted = true
music.volume = 0.3
music.play().then(() => {
    music.muted = false
    syncMusicButton()
}).catch(() => {
    syncMusicButton()
    document.addEventListener('pointerdown', () => {
        music.muted = false
        music.play().then(syncMusicButton).catch(syncMusicButton)
    }, { once: true })
})

music.addEventListener('play', syncMusicButton)
music.addEventListener('pause', syncMusicButton)

function toggleMusic() {
    if (!music.paused && !music.muted) {
        music.pause()
    } else {
        music.muted = false
        music.play().catch(syncMusicButton)
    }
    syncMusicButton()
}

function handleYesClick() {
    // One nudge to try No, then Yes always goes through.
    if (!yesTeased && noClickCount === 0) {
        yesTeased = true
        const msg = yesTeasePokes[Math.floor(Math.random() * yesTeasePokes.length)]
        showTeaseMessage(msg)
        return
    }
    window.location.href = 'yes.html'
}

function showTeaseMessage(msg) {
    const toast = document.getElementById('tease-toast')
    toast.textContent = msg
    toast.classList.add('show')
}

function hideTeaseMessage() {
    const toast = document.getElementById('tease-toast')
    toast.classList.remove('show')
}

function handleNoClick() {
    hideTeaseMessage()
    noClickCount++

    // Cycle through guilt-trip messages
    const msgIndex = Math.min(noClickCount, noMessages.length - 1)
    noBtn.textContent = noMessages[msgIndex]

    growYes()

    if (noClickCount >= 2) {
        const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize)
        noBtn.style.fontSize = `${Math.max(noSize * 0.92, 13)}px`
    }

    const gifIndex = Math.min(noClickCount, gifStages.length - 1)
    swapGif(gifStages[gifIndex])

    // Runaway lines up with the last line: "You can't catch me anyway"
    if (noClickCount >= noMessages.length - 1 && !runawayEnabled) {
        enableRunaway()
        runawayEnabled = true
    }
}

function growYes() {
    const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize)
    const maxFont = Math.min(112, Math.max(40, window.innerWidth * 0.14))
    yesBtn.style.fontSize = `${Math.min(currentSize * 1.28, maxFont)}px`

    const padY = Math.min(16 + noClickCount * 3, 40)
    const padX = Math.min(36 + noClickCount * 6, Math.max(48, window.innerWidth * 0.1))
    yesBtn.style.padding = `${padY}px ${padX}px`
}

let gifRequest = 0

function swapGif(src) {
    if (catGif.getAttribute('src') === src) return

    const request = ++gifRequest
    const previous = catGif.src
    const incoming = new Image()
    incoming.onload = () => {
        if (request !== gifRequest) return
        catGif.style.opacity = '0'
        window.setTimeout(() => {
            if (request !== gifRequest) return
            catGif.src = src
            catGif.style.opacity = '1'
        }, 180)
    }
    incoming.onerror = () => {
        if (request !== gifRequest) return
        catGif.src = previous
        catGif.style.opacity = '1'
    }
    incoming.src = src
}

function enableRunaway() {
    const rect = noBtn.getBoundingClientRect()
    noBtn.style.transition = 'none'
    noBtn.style.position = 'fixed'
    noBtn.style.margin = '0'
    noBtn.style.left = `${rect.left}px`
    noBtn.style.top = `${rect.top}px`
    noBtn.style.zIndex = '50'
    noBtn.getBoundingClientRect()
    noBtn.style.transition = 'left 0.22s ease, top 0.22s ease, background 0.2s'

    // Taking No out of the flow re-centers Yes, which can slide under No.
    if (overlapsYes(rect.left, rect.top, noBtn.offsetWidth, noBtn.offsetHeight)) {
        placeNoButton(-1000, -1000)
    }

    noBtn.addEventListener('mouseenter', (event) => {
        placeNoButton(event.clientX, event.clientY)
    })
    noBtn.addEventListener('touchstart', (event) => {
        if (event.cancelable) event.preventDefault()
        const touch = event.touches[0]
        placeNoButton(touch.clientX, touch.clientY)
    }, { passive: false })
}

function placeNoButton(avoidX, avoidY) {
    const margin = 12
    const btnW = noBtn.offsetWidth
    const btnH = noBtn.offsetHeight
    const maxX = Math.max(margin, window.innerWidth - btnW - margin)
    const maxY = Math.max(margin, window.innerHeight - btnH - margin)

    let x = margin
    let y = margin
    for (let attempt = 0; attempt < 40; attempt++) {
        x = margin + Math.random() * (maxX - margin)
        y = margin + Math.random() * (maxY - margin)
        const coversPointer = avoidX >= x - 28 && avoidX <= x + btnW + 28
            && avoidY >= y - 28 && avoidY <= y + btnH + 28
        if (!coversPointer && !overlapsYes(x, y, btnW, btnH) && !overlapsMusic(x, y, btnW, btnH)) break
    }

    noBtn.style.left = `${x}px`
    noBtn.style.top = `${y}px`
}

function overlapsYes(x, y, w, h) {
    const gap = 16
    const yes = yesBtn.getBoundingClientRect()
    return x < yes.right + gap && x + w > yes.left - gap
        && y < yes.bottom + gap && y + h > yes.top - gap
}

function overlapsMusic(x, y, w, h) {
    const gap = 8
    const musicBox = musicToggle.getBoundingClientRect()
    return x < musicBox.right + gap && x + w > musicBox.left - gap
        && y < musicBox.bottom + gap && y + h > musicBox.top - gap
}
