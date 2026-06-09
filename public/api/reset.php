<?php
header('Content-Type: application/json');

$dataDir = __DIR__ . '/../../data';
$usersFile = $dataDir . '/users.txt';

if (!file_exists($usersFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$dob = $input['dob'] ?? '';
$city = $input['city'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (!$username || !$dob || !$city || !$newPassword) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

$city = trim(strtolower($city));
$dob = trim($dob);

$users = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$found = false;
$updatedUsers = [];

foreach ($users as $line) {
    $parts = explode(':', $line);
    $u = $parts[0] ?? '';
    $p = $parts[1] ?? '';
    $d = $parts[2] ?? '';
    $c = $parts[3] ?? '';

    if ($u === $username) {
        if ($d === $dob && $c === $city) {
            // Match found! Update password
            $found = true;
            $hashed = md5($newPassword);
            $updatedUsers[] = "$u:$hashed:$d:$c";
        } else {
            // Incorrect security info
            http_response_code(401);
            echo json_encode(['error' => 'Incorrect date of birth or city. (Old accounts without security info cannot be reset)']);
            exit;
        }
    } else {
        $updatedUsers[] = $line; // Keep other users unchanged
    }
}

if ($found) {
    file_put_contents($usersFile, implode("\n", $updatedUsers) . "\n");
    echo json_encode(['success' => true]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
}
