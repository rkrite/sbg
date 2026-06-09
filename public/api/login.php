<?php
header('Content-Type: application/json');

$dataDir = __DIR__ . '/../../data';
$usersFile = $dataDir . '/users.txt';
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, '');
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

$users = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($users as $line) {
    $parts = explode(':', $line);
    $u = $parts[0] ?? '';
    $p = $parts[1] ?? '';
    
    if ($u === $username && $p === md5($password)) {
        echo json_encode(['success' => true, 'username' => $username]);
        exit;
    }
}

http_response_code(401);
echo json_encode(['error' => 'Invalid credentials']);
