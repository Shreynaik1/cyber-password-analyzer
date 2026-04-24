// --- Matrix Canvas Effect ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/\\~`';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = canvas.width / fontSize;
    for(let i = drops.length; i < newColumns; i++) {
        drops[i] = 1;
    }
});

// --- Hacker Background Simulation ---
const hackBg = document.getElementById('hack-bg');
function generateHackText() {
    const segments = [
        "0x000F8A", "INIT_MEM", "OVERFLOW_ERR", "SYS_REBOOT", "ACCESS_DENIED",
        "ENCRYPTING...", "DECRYPTING...", "BYPASS_FIREWALL", "SQL_INJECTION",
        "PORT_SCAN", "ROOTKIT_DEPLOYED", "PACKET_SNIFFING", "BUFFER_OVERFLOW"
    ];
    let content = "";
    for(let i = 0; i < 200; i++) {
        content += segments[Math.floor(Math.random() * segments.length)] + " ";
        if(Math.random() > 0.8) content += "<br>";
    }
    hackBg.innerHTML = content;
}
setInterval(generateHackText, 2000);
generateHackText();

// --- Password Analyzer Logic ---
const pwdInput = document.getElementById('password-input');
const toggleBtn = document.getElementById('toggle-pwd');
const copyBtn = document.getElementById('copy-pwd');
const testBtn = document.getElementById('test-btn');
const progressBar = document.getElementById('progress-bar');
const strengthText = document.getElementById('strength-text');
const scoreText = document.getElementById('score-text');
const timeText = document.getElementById('time-text');
const terminal = document.getElementById('terminal-output');

// Requirements elements
const reqLength = document.getElementById('req-length');
const reqUpper = document.getElementById('req-upper');
const reqLower = document.getElementById('req-lower');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');
const reqEntropy = document.getElementById('req-entropy');

const commonPasswords = ['password', '123456', '123456789', 'qwerty', '12345', '12345678', '111111', '1234567', 'dragon', 'iloveyou', 'admin'];

// Helper to log to terminal
function logTerminal(msg, type = 'sys') {
    const line = document.createElement('div');
    line.className = 'line';
    
    let prefix = 'SYSTEM:';
    if(type === 'warn') prefix = 'WARNING:';
    if(type === 'err') prefix = 'ERROR:';
    if(type === 'success') prefix = 'SUCCESS:';
    
    line.innerHTML = `<span class="${type}">${prefix}</span> ${msg}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// Check if string contains repeating sequence (e.g. 123123)
function hasRepeatingSequence(str) {
    const re = /^(.+)\1+$/;
    return re.test(str);
}

// Main evaluation function
function analyzePassword(pwd) {
    if (!pwd) {
        resetUI();
        return;
    }

    let score = 0;
    let feedback = [];
    
    // 1. Length
    if (pwd.length >= 8) {
        score += 20;
        if(pwd.length >= 12) score += 10;
        reqLength.classList.add('met');
        reqLength.innerText = '[X] Length >= 8';
    } else {
        reqLength.classList.remove('met');
        reqLength.innerText = '[ ] Length >= 8';
        feedback.push("Password too short");
    }

    // 2. Uppercase
    if (/[A-Z]/.test(pwd)) {
        score += 15;
        reqUpper.classList.add('met');
        reqUpper.innerText = '[X] Uppercase';
    } else {
        reqUpper.classList.remove('met');
        reqUpper.innerText = '[ ] Uppercase';
        feedback.push("Missing uppercase");
    }

    // 3. Lowercase
    if (/[a-z]/.test(pwd)) {
        score += 15;
        reqLower.classList.add('met');
        reqLower.innerText = '[X] Lowercase';
    } else {
        reqLower.classList.remove('met');
        reqLower.innerText = '[ ] Lowercase';
        feedback.push("Missing lowercase");
    }

    // 4. Numbers
    if (/[0-9]/.test(pwd)) {
        score += 15;
        reqNumber.classList.add('met');
        reqNumber.innerText = '[X] Number';
    } else {
        reqNumber.classList.remove('met');
        reqNumber.innerText = '[ ] Number';
        feedback.push("Missing numbers");
    }

    // 5. Special Characters
    if (/[^A-Za-z0-9]/.test(pwd)) {
        score += 20;
        if((pwd.match(/[^A-Za-z0-9]/g) || []).length > 1) score += 5;
        reqSpecial.classList.add('met');
        reqSpecial.innerText = '[X] Special Char';
    } else {
        reqSpecial.classList.remove('met');
        reqSpecial.innerText = '[ ] Special Char';
        feedback.push("Add symbols for better security");
    }

    // 6. Entropy / Unique chars
    const uniqueChars = new Set(pwd.split('')).size;
    if (uniqueChars >= pwd.length * 0.7 && pwd.length > 5) {
        reqEntropy.classList.add('met');
        reqEntropy.innerText = '[X] High Entropy';
    } else {
        reqEntropy.classList.remove('met');
        reqEntropy.innerText = '[ ] High Entropy';
    }

    // Deductions
    // Common password
    if (commonPasswords.includes(pwd.toLowerCase())) {
        score = Math.min(score, 10);
        feedback.push("Found in common password dictionary!");
        logTerminal("Common password detected. Highly vulnerable.", "err");
    }
    
    // Keyboard patterns (e.g. qwerty)
    if (/qwerty|asdf|zxcv|1234|qaz/i.test(pwd)) {
        score -= 15;
        feedback.push("Keyboard pattern detected");
    }

    // Repeating characters (e.g. aaa)
    if (/(.)\1{2,}/.test(pwd)) {
        score -= 15;
        feedback.push("Contains repeated characters");
    }

    // Repeating sequences
    if (hasRepeatingSequence(pwd)) {
        score -= 15;
        feedback.push("Contains repeated sequences");
    }

    score = Math.max(0, Math.min(100, score));
    updateUI(score, pwd.length, uniqueChars, feedback);
}

function updateUI(score, len, unique, feedback) {
    scoreText.innerText = score;
    progressBar.style.width = score + '%';

    // Time to crack logic (simplified heuristic)
    let timeEst = "INSTANT";
    let combinations = Math.pow(unique > 0 ? unique * 2 : 10, len);
    
    if(score < 20) timeEst = "INSTANT";
    else if(score < 40) timeEst = "A FEW SECONDS";
    else if(score < 60) timeEst = "SEVERAL HOURS";
    else if(score < 80) timeEst = "A FEW YEARS";
    else if(score < 95) timeEst = "CENTURIES";
    else timeEst = "MILLENNIA";
    
    timeText.innerText = timeEst;

    let colors = {
        bg: "var(--neon-red)",
        boxShadow: "var(--neon-red-glow)",
        strengthClass: "strength-weak",
        strengthText: "CRITICAL"
    };

    if (score >= 80) {
        colors = { bg: "var(--neon-green)", boxShadow: "var(--neon-green-glow)", strengthClass: "strength-hacker", strengthText: "HACKER LEVEL" };
        logTerminal(`Entropy sufficient. Resistance to brute force: HIGH`, 'success');
    } else if (score >= 60) {
        colors = { bg: "var(--neon-blue)", boxShadow: "var(--neon-blue-glow)", strengthClass: "strength-strong", strengthText: "STRONG" };
    } else if (score >= 40) {
        colors = { bg: "var(--neon-yellow)", boxShadow: "var(--neon-yellow-glow)", strengthClass: "strength-good", strengthText: "MODERATE" };
    } else if (score >= 20) {
        colors = { bg: "var(--neon-orange)", boxShadow: "var(--neon-orange-glow)", strengthClass: "strength-medium", strengthText: "WEAK" };
    } else {
        if(feedback.length > 0) {
            logTerminal(`Vulnerability detected: ${feedback[0]}`, 'warn');
        }
    }

    progressBar.style.background = colors.bg;
    progressBar.style.boxShadow = colors.boxShadow;
    strengthText.className = colors.strengthClass;
    strengthText.innerText = colors.strengthText;
}

function resetUI() {
    scoreText.innerText = '0';
    progressBar.style.width = '0%';
    progressBar.style.background = 'var(--neon-red)';
    progressBar.style.boxShadow = 'var(--neon-red-glow)';
    strengthText.className = 'strength-weak';
    strengthText.innerText = 'CRITICAL';
    timeText.innerText = 'INSTANT';
    
    document.querySelectorAll('.req-item').forEach(item => {
        item.classList.remove('met');
        item.innerText = item.innerText.replace('[X]', '[ ]');
    });
}

// Event Listeners
pwdInput.addEventListener('input', (e) => {
    analyzePassword(e.target.value);
});

toggleBtn.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    } else {
        pwdInput.type = 'password';
        toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }
});

copyBtn.addEventListener('click', () => {
    if(!pwdInput.value) return;
    navigator.clipboard.writeText(pwdInput.value).then(() => {
        logTerminal("String copied to clipboard", "success");
    });
});

testBtn.addEventListener('click', () => {
    if(!pwdInput.value) {
        logTerminal("No input provided for analysis.", "err");
        return;
    }
    logTerminal("Initiating deep security scan...", "sys");
    
    testBtn.disabled = true;
    testBtn.innerText = "SCANNING...";
    
    setTimeout(() => {
        logTerminal("Checking dictionary hashes...", "sys");
    }, 500);
    
    setTimeout(() => {
        logTerminal("Analyzing character permutations...", "sys");
    }, 1000);
    
    setTimeout(() => {
        const score = parseInt(scoreText.innerText);
        if(score > 80) {
            logTerminal("Scan complete. Hash robust.", "success");
        } else if (score > 40) {
            logTerminal("Scan complete. Partial vulnerabilities found.", "warn");
        } else {
            logTerminal("Scan complete. Hash critical failure.", "err");
        }
        testBtn.disabled = false;
        testBtn.innerText = "EXECUTE_TEST()";
    }, 2000);
});

// Init
logTerminal("UI interface loaded. Ready.", "success");
