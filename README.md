# Star Battle

A modern, browser-based implementation of the logic puzzle game "Star Battle".

## How to Play

The objective of Star Battle is to fill the grid with stars following these rules:
1. **One Star per Row**: Every row must contain exactly one star.
2. **One Star per Column**: Every column must contain exactly one star.
3. **One Star per Region**: Every colored region must contain exactly one star.
4. **No Adjacency**: Stars cannot touch each other, not even diagonally.

Click on any cell to cycle through its states:
- `Clear` (Empty)
- `Flag` (Marked as NOT a star, using an 'X')
- `Star` (Starred cell)

## Features
- **Dynamic Board Generation**: Fully functional puzzle generator producing uniquely generated, valid grids on every refresh.
- **Multiple Sizes**: Play sizes from 6x6 to 10x10.
- **User Accounts**: Register an account to save your high scores.
- **Password Reset**: Reset your password securely using your date of birth and city of birth.
- **Leaderboard**: Compete for the fastest clear time on any given board size.
- **UI Customization**: Toggle colored regions on or off based on your visual preference.

## Tech Stack
- **Frontend**: Vanilla HTML5, JavaScript (ES6), and modern CSS3 featuring a sleek dark-mode glassmorphic design and CSS animations.
- **Backend**: Native PHP endpoints (`/api/`) providing a simple and lightweight API.
- **Database**: Flat-file text storage (`data/users.txt` and `data/scores.txt`) for maximum portability without needing MySQL.

## Local Development Setup

To run this project locally, you will need a PHP development environment (like Laravel Valet, XAMPP, or a simple PHP built-in server).

### Using PHP Built-in Server
1. Clone the repository.
2. Navigate to the project root directory.
3. Ensure the `data/` directory is writable.
4. Start the PHP server pointing to the `public/` directory:
   ```bash
   php -S localhost:8000 -t public
   ```
5. Open your browser and navigate to `http://localhost:8000`

### Using Laravel Valet (Recommended)
If using Valet, simply link the directory:
```bash
cd ~/web/sbg
valet link sbg
```
Then visit `http://sbg.test` (or `http://sbg.tst` depending on your TLD configuration).

## Data Permissions
The application requires write permissions to the `data/` directory to save user credentials and high scores. If you encounter silent registration failures, ensure that your web server user has write access:
```bash
chmod 777 data/ data/*.txt
```
