class PuzzleGenerator {
    static generate(size) {
        let stars;
        // 1. Generate valid star layout
        while (true) {
            stars = this.placeStars(size);
            if (stars) break;
        }

        // 2. Generate regions using Multi-source Dijkstra (Shortest Path Forest)
        // This guarantees N contiguous regions, each containing exactly one star.
        const regions = this.generateRegions(size, stars);

        return { size, stars, regions };
    }

    static placeStars(size) {
        const stars = [];
        const colsUsed = new Set();

        const isValid = (r, c) => {
            if (colsUsed.has(c)) return false;
            // Check diagonal and orthogonal touches
            for (const star of stars) {
                const dr = Math.abs(star.r - r);
                const dc = Math.abs(star.c - c);
                if (dr <= 1 && dc <= 1) return false;
            }
            return true;
        };

        const backtrack = (r) => {
            if (r === size) return true; // All rows placed
            
            // Try random columns for this row
            const cols = Array.from({length: size}, (_, i) => i);
            this.shuffle(cols);

            for (const c of cols) {
                if (isValid(r, c)) {
                    stars.push({r, c});
                    colsUsed.add(c);
                    
                    if (backtrack(r + 1)) return true;
                    
                    // Backtrack
                    stars.pop();
                    colsUsed.delete(c);
                }
            }
            return false;
        };

        if (backtrack(0)) {
            return stars;
        }
        return null;
    }

    static generateRegions(size, stars) {
        const regions = Array.from({length: size}, () => Array(size).fill(-1));
        const costs = Array.from({length: size}, () => Array(size).fill(Infinity));
        
        // Priority queue (using simple array sorting for small N)
        let pq = [];

        // Cell weights to introduce randomness in region shapes
        const cellWeights = Array.from({length: size}, () => Array.from({length: size}, () => Math.random() * 10));

        // Initialize with stars
        stars.forEach((star, index) => {
            regions[star.r][star.c] = index;
            costs[star.r][star.c] = 0;
            
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            for (const [dr, dc] of dirs) {
                const nr = star.r + dr, nc = star.c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    pq.push({r: nr, c: nc, cost: cellWeights[nr][nc], region: index});
                }
            }
        });

        while (pq.length > 0) {
            pq.sort((a, b) => a.cost - b.cost);
            const curr = pq.shift();

            if (regions[curr.r][curr.c] !== -1) continue; // Already assigned

            // Assign region
            regions[curr.r][curr.c] = curr.region;
            costs[curr.r][curr.c] = curr.cost;

            // Expand to neighbors
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            for (const [dr, dc] of dirs) {
                const nr = curr.r + dr, nc = curr.c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
                    pq.push({
                        r: nr, 
                        c: nc, 
                        cost: curr.cost + cellWeights[nr][nc], 
                        region: curr.region
                    });
                }
            }
        }

        return regions;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
