<?php
header('Content-Type: application/json');

$dataDir = __DIR__ . '/../../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
$scoresFile = $dataDir . '/scores.txt';
if (!file_exists($scoresFile)) {
    file_put_contents($scoresFile, '');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $size = $input['size'] ?? 0;
    $time = $input['time'] ?? null;

    if (!$username || !$size || $time === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameters']);
        exit;
    }

    file_put_contents($scoresFile, "$username:$size:$time\n", FILE_APPEND);
    echo json_encode(['success' => true]);
    exit;
}

// GET request
$scores = file($scoresFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$grouped = [6 => [], 7 => [], 8 => [], 9 => [], 10 => []];

foreach ($scores as $line) {
    list($u, $s, $t) = explode(':', $line);
    $s = (int)$s;
    if (isset($grouped[$s])) {
        $grouped[$s][] = [
            'username' => $u,
            'size' => $s,
            'time' => (int)$t
        ];
    }
}

foreach ($grouped as $size => &$list) {
    usort($list, function($a, $b) {
        return $a['time'] <=> $b['time'];
    });
    $list = array_slice($list, 0, 10);
}

echo json_encode($grouped);
