class Game {
    constructor(ui) {
        this.ui = ui;
        this.size = 8;
        this.board = []; // 0: clear, 1: flag, 2: star
        this.solution = null;
        this.startTime = null;
        this.timerInterval = null;
        this.playing = false;
        
        this.showColors = true;
    }

    startNewGame(sizeStr) {
        let newSize;
        if (sizeStr === 'random') {
            newSize = Math.floor(Math.random() * 5) + 6; // 6 to 10
        } else {
            newSize = parseInt(sizeStr, 10);
        }
        this.size = newSize;

        // Generate puzzle
        this.solution = PuzzleGenerator.generate(this.size);
        
        // Initialize board state
        this.board = Array.from({length: this.size}, () => Array(this.size).fill(0));
        
        this.playing = true;
        this.startTime = Date.now();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if(this.playing) this.ui.updateTimer(this.getElapsedSeconds());
        }, 1000);
        this.ui.updateTimer(0);
        
        this.ui.renderBoard(this);
    }

    getElapsedSeconds() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    handleCellClick(r, c) {
        if (!this.playing) return;

        // Cycle: 0 -> 1 -> 2 -> 0 (clear -> flag -> star)
        this.board[r][c] = (this.board[r][c] + 1) % 3;

        this.ui.renderBoard(this);
        this.checkWinCondition();
    }

    checkWinCondition() {
        // Count stars in rows, cols, regions
        const rowCounts = Array(this.size).fill(0);
        const colCounts = Array(this.size).fill(0);
        const regCounts = Array(this.size).fill(0);

        let totalStars = 0;

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 2) {
                    totalStars++;
                    rowCounts[r]++;
                    colCounts[c]++;
                    regCounts[this.solution.regions[r][c]]++;

                    // Check adjacency
                    const dirs = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
                    for (const [dr, dc] of dirs) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                            if (this.board[nr][nc] === 2) {
                                return false; // Adjacent stars
                            }
                        }
                    }
                }
            }
        }

        if (totalStars !== this.size) return false;

        for (let i = 0; i < this.size; i++) {
            if (rowCounts[i] !== 1 || colCounts[i] !== 1 || regCounts[i] !== 1) {
                return false;
            }
        }

        // Win!
        this.playing = false;
        clearInterval(this.timerInterval);
        
        const finalTime = this.getElapsedSeconds();
        this.ui.showWin(finalTime, this.size);
    }
}
