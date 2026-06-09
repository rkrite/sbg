class Api {
    static async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async register(username, password, dob, city) {
        return this.request('/api/register.php', 'POST', { username, password, dob, city });
    }

    static async login(username, password) {
        return this.request('/api/login.php', 'POST', { username, password });
    }

    static async resetPassword(username, dob, city, newPassword) {
        return this.request('/api/reset.php', 'POST', { username, dob, city, newPassword });
    }

    static async getScores() {
        return this.request('/api/scores.php');
    }

    static async submitScore(username, size, time) {
        return this.request('/api/scores.php', 'POST', { username, size, time });
    }
}
