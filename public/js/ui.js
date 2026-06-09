class UI {
    constructor() {
        this.game = new Game(this);
        this.currentUser = null;

        // DOM elements
        this.boardEl = document.getElementById('board');
        this.timeDisplay = document.getElementById('time-display');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.winOverlay = document.getElementById('win-overlay');
        this.winTime = document.getElementById('win-time');
        
        this.loginDialog = document.getElementById('login-dialog');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.registerFields = document.getElementById('register-fields');
        this.btnShowRegister = document.getElementById('btn-show-register');
        this.btnRegister = document.getElementById('btn-register');
        this.btnLogin = document.getElementById('btn-login');
        this.linkForgotPassword = document.getElementById('link-forgot-password');

        this.resetDialog = document.getElementById('reset-dialog');
        this.resetForm = document.getElementById('reset-form');
        this.resetError = document.getElementById('reset-error');
        this.resetSuccess = document.getElementById('reset-success');
        this.btnCancelReset = document.getElementById('btn-cancel-reset');
        this.btnSubmitReset = document.getElementById('btn-submit-reset');

        this.userDisplay = document.getElementById('user-display');
        this.btnLogout = document.getElementById('btn-logout');
        this.btnLoginModal = document.getElementById('btn-login-modal');

        this.initEventListeners();
        this.loadScores();
    }

    initEventListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => {
            this.loadingOverlay.classList.remove('hidden');
            // Give UI time to show loading before synchronous generation blocks main thread
            setTimeout(() => {
                const sizeStr = document.getElementById('size-select').value;
                this.game.startNewGame(sizeStr);
                this.loadingOverlay.classList.add('hidden');
                this.winOverlay.classList.add('hidden');
            }, 50);
        });

        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.winOverlay.classList.add('hidden');
            document.getElementById('btn-new-game').click();
        });

        document.getElementById('show-colors-toggle').addEventListener('change', (e) => {
            this.game.showColors = e.target.checked;
            this.renderBoard(this.game);
        });

        // Auth
        this.btnLoginModal.addEventListener('click', () => {
            this.loginDialog.showModal();
            // Reset to default login view
            this.registerFields.classList.add('hidden');
            this.btnShowRegister.classList.remove('hidden');
            this.btnRegister.classList.add('hidden');
            this.btnLogin.classList.remove('hidden');
            this.loginForm.querySelector('h2').textContent = 'Login or Register';
        });

        document.getElementById('btn-cancel-login').addEventListener('click', () => {
            this.loginDialog.close();
            this.loginError.textContent = '';
        });

        this.btnShowRegister.addEventListener('click', () => {
            this.registerFields.classList.remove('hidden');
            this.btnShowRegister.classList.add('hidden');
            this.btnLogin.classList.add('hidden');
            this.btnRegister.classList.remove('hidden');
            this.loginForm.querySelector('h2').textContent = 'Register';
        });

        this.btnRegister.addEventListener('click', async () => {
            if (!this.loginForm.checkValidity()) {
                this.loginForm.reportValidity();
                return;
            }
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const dob = document.getElementById('dob').value;
            const city = document.getElementById('city').value;
            try {
                const res = await Api.register(username, password, dob, city);
                this.handleLoginSuccess(res.username);
            } catch (err) {
                this.loginError.textContent = err.message;
            }
        });

        document.getElementById('btn-login').addEventListener('click', async (e) => {
            e.preventDefault();
            if (!this.loginForm.checkValidity()) {
                this.loginForm.reportValidity();
                return;
            }
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const res = await Api.login(username, password);
                this.handleLoginSuccess(res.username);
            } catch (err) {
                this.loginError.textContent = err.message;
            }
        });

        this.btnLogout.addEventListener('click', () => {
            this.currentUser = null;
            this.userDisplay.textContent = 'Not logged in';
            this.btnLoginModal.classList.remove('hidden');
            this.btnLogout.classList.add('hidden');
        });

        // Forgot Password Flow
        this.linkForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginDialog.close();
            this.resetDialog.showModal();
        });

        this.btnCancelReset.addEventListener('click', () => {
            this.resetDialog.close();
            this.resetError.textContent = '';
            this.resetSuccess.textContent = '';
        });

        this.btnSubmitReset.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!this.resetForm.checkValidity()) {
                this.resetForm.reportValidity();
                return;
            }
            const u = document.getElementById('reset-username').value;
            const d = document.getElementById('reset-dob').value;
            const c = document.getElementById('reset-city').value;
            const np = document.getElementById('reset-new-password').value;
            
            this.resetError.textContent = '';
            this.resetSuccess.textContent = '';

            try {
                await Api.resetPassword(u, d, c, np);
                this.resetSuccess.textContent = 'Password reset successfully! You can now log in.';
                setTimeout(() => {
                    this.resetDialog.close();
                    this.resetForm.reset();
                    this.resetSuccess.textContent = '';
                    this.btnLoginModal.click();
                }, 2000);
            } catch (err) {
                this.resetError.textContent = err.message;
            }
        });
    }

    handleLoginSuccess(username) {
        this.currentUser = username;
        this.userDisplay.textContent = `Player: ${username}`;
        this.btnLoginModal.classList.add('hidden');
        this.btnLogout.classList.remove('hidden');
        this.loginDialog.close();
        this.loginForm.reset();
        this.loginError.textContent = '';
    }

    updateTimer(seconds) {
        this.timeDisplay.textContent = seconds;
    }

    renderBoard(game) {
        if (!game.solution) return;

        this.boardEl.innerHTML = '';
        this.boardEl.style.gridTemplateColumns = `repeat(${game.size}, 1fr)`;

        // Lighter, more cheerful pastel colors for regions
        const regionColors = [
            '#fca5a5', // light red/pink
            '#fdba74', // peach/orange
            '#fde047', // bright yellow
            '#86efac', // mint green
            '#5eead4', // teal
            '#93c5fd', // sky blue
            '#a5b4fc', // periwinkle
            '#d8b4fe', // light purple
            '#f9a8d4', // bright pink
            '#cbd5e1'  // light slate
        ];

        // To track errors (multiple stars in row/col/region or touching)
        const rowStars = Array(game.size).fill(0);
        const colStars = Array(game.size).fill(0);
        const regStars = Array(game.size).fill(0);
        const starsList = [];

        for (let r = 0; r < game.size; r++) {
            for (let c = 0; c < game.size; c++) {
                if (game.board[r][c] === 2) {
                    rowStars[r]++;
                    colStars[c]++;
                    regStars[game.solution.regions[r][c]]++;
                    starsList.push({r, c});
                }
            }
        }

        const isError = (r, c) => {
            if (game.board[r][c] !== 2) return false;
            if (rowStars[r] > 1 || colStars[c] > 1 || regStars[game.solution.regions[r][c]] > 1) return true;
            // Check adjacent touching
            for (const other of starsList) {
                if (other.r === r && other.c === c) continue;
                const dr = Math.abs(other.r - r);
                const dc = Math.abs(other.c - c);
                if (dr <= 1 && dc <= 1) return true;
            }
            return false;
        };

        for (let r = 0; r < game.size; r++) {
            for (let c = 0; c < game.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Add state
                if (game.board[r][c] === 1) cell.classList.add('flag');
                else if (game.board[r][c] === 2) {
                    cell.classList.add('star');
                    if (isError(r, c)) cell.classList.add('error');
                }

                // Add regions styling
                const regionId = game.solution.regions[r][c];
                if (game.showColors) {
                    // Use a cheerful opacity (approx 35%)
                    cell.style.backgroundColor = regionColors[regionId % regionColors.length] + '55';
                }

                // Add borders
                if (r === 0 || game.solution.regions[r-1][c] !== regionId) cell.classList.add('border-top');
                else cell.classList.add('border-thin-top');

                if (r === game.size - 1 || game.solution.regions[r+1][c] !== regionId) cell.classList.add('border-bottom');
                else cell.classList.add('border-thin-bottom');

                if (c === 0 || game.solution.regions[r][c-1] !== regionId) cell.classList.add('border-left');
                else cell.classList.add('border-thin-left');

                if (c === game.size - 1 || game.solution.regions[r][c+1] !== regionId) cell.classList.add('border-right');
                else cell.classList.add('border-thin-right');

                cell.addEventListener('click', () => game.handleCellClick(r, c));

                this.boardEl.appendChild(cell);
            }
        }
    }

    async showWin(time, size) {
        this.winTime.textContent = time;
        this.winOverlay.classList.remove('hidden');

        if (this.currentUser) {
            try {
                await Api.submitScore(this.currentUser, size, time);
                this.loadScores(); // Reload scores
            } catch (e) {
                console.error('Failed to submit score:', e);
            }
        }
    }

    async loadScores() {
        const container = document.getElementById('scores-container');
        try {
            const scores = await Api.getScores();
            container.innerHTML = '';
            
            for (const size of [6, 7, 8, 9, 10]) {
                const sizeGroup = document.createElement('div');
                sizeGroup.className = 'score-size-group';
                sizeGroup.innerHTML = `<h3>${size}x${size}</h3>`;
                
                if (!scores[size] || scores[size].length === 0) {
                    sizeGroup.innerHTML += `<p style="color: #94a3b8; font-size: 0.9rem;">No scores yet.</p>`;
                } else {
                    const list = document.createElement('div');
                    list.className = 'score-list';
                    scores[size].forEach((score, index) => {
                        list.innerHTML += `
                            <div class="score-item">
                                <span class="rank">${index + 1}.</span>
                                <span class="name">${score.username}</span>
                                <span class="time">${score.time}s</span>
                            </div>
                        `;
                    });
                    sizeGroup.appendChild(list);
                }
                container.appendChild(sizeGroup);
            }
        } catch (e) {
            container.innerHTML = `<p style="color: #ef4444;">Failed to load scores.</p>`;
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI();
    // Start initial default game
    document.getElementById('btn-new-game').click();
});
