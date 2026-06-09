<?php
header('Content-Type: application/json');

$dataDir = __DIR__ . '/../../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
$usersFile = $dataDir . '/users.txt';
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, '');
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';
$dob = $input['dob'] ?? '';
$city = $input['city'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$city = trim(strtolower($city));
$dob = trim($dob);
$username = str_replace(':', '', $username);
$dob = str_replace(':', '', $dob);
$city = str_replace(':', '', $city);

$users = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($users as $line) {
    $parts = explode(':', $line);
    $u = $parts[0] ?? '';
    if ($u === $username) {
        http_response_code(400);
        echo json_encode(['error' => 'That username is already taken. Please choose a different one.']);
        exit;
    }
}

$hashed = md5($password);
file_put_contents($usersFile, "$username:$hashed:$dob:$city\n", FILE_APPEND);

echo json_encode(['success' => true, 'username' => $username]);
