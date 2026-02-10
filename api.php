<?php
/**
 * DAT CLOUDE | MySQL Backend Bridge for cPanel
 * Place this file in your public_html folder.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// --- DATABASE CONFIGURATION ---
// Update these with your cPanel MySQL details
$db_host = 'localhost';
$db_name = 'your_database_name';
$db_user = 'your_database_user';
$db_pass = 'your_database_password';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database Connection Failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'name' => $user['full_name'],
                    'email' => $user['email'],
                    'isAdmin' => $user['role'] === 'admin'
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password.']);
        }
        break;

    case 'register':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $email = $data['email'] ?? '';
        $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
        $fullName = $data['fullName'] ?? '';
        $id = bin2hex(random_bytes(16));
        $role = ($email === 'datcloud20@gmail.com') ? 'admin' : 'user';
        
        try {
            $stmt = $pdo->prepare("INSERT INTO users (id, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $fullName, $email, $password, $role]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered or registration failed.']);
        }
        break;

    case 'get_config':
        $stmt = $pdo->query("SELECT * FROM site_config WHERE id = 1");
        $row = $stmt->fetch();
        if ($row) {
            $config = [
                'logoText' => $row['logo_text'],
                'logoImageUrl' => $row['logo_image_url'],
                'logoPosition' => $row['logo_position'],
                'logoX' => (int)$row['logo_x'],
                'logoY' => (int)$row['logo_y'],
                'footerDescription' => $row['footer_description'],
                'heroTitle' => $row['hero_title'],
                'heroSubtitle' => $row['hero_subtitle'],
                'heroImageUrl' => $row['hero_image_url'],
                'heroVideoUrl' => $row['hero_video_url'],
                'heroVideoOpacity' => (int)$row['hero_video_opacity'],
                'heroTextColor' => $row['hero_text_color'],
                'heroTextPosition' => $row['hero_text_position'],
                'heroTitleSize' => (float)$row['hero_title_size'],
                'heroImageSize' => (int)$row['hero_image_size'],
                'heroImageX' => (int)$row['hero_image_x'],
                'heroImageY' => (int)$row['hero_image_y'],
                'stats' => json_decode($row['stats'], true) ?: [],
                'socials' => json_decode($row['socials'], true) ?: [],
                'tools' => json_decode($row['tools'], true) ?: [],
                'contactEmail' => $row['contact_email'],
                'whatsappNumber' => $row['whatsapp_number']
            ];
            echo json_encode($config);
        } else {
            echo json_encode((object)[]);
        }
        break;

    case 'update_config':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $stmt = $pdo->prepare("UPDATE site_config SET 
            logo_text = ?, logo_image_url = ?, logo_position = ?, logo_x = ?, logo_y = ?,
            footer_description = ?, hero_title = ?, hero_subtitle = ?, hero_image_url = ?,
            hero_video_url = ?, hero_video_opacity = ?, hero_text_color = ?, 
            hero_text_position = ?, hero_title_size = ?, hero_image_size = ?,
            hero_image_x = ?, hero_image_y = ?, stats = ?, socials = ?, tools = ?,
            contact_email = ?, whatsapp_number = ?
            WHERE id = 1");
        
        $stmt->execute([
            $data['logoText'] ?? '', $data['logoImageUrl'] ?? '', $data['logoPosition'] ?? 'left', $data['logoX'] ?? 0, $data['logoY'] ?? 0,
            $data['footerDescription'] ?? '', $data['heroTitle'] ?? '', $data['heroSubtitle'] ?? '', $data['heroImageUrl'] ?? '',
            $data['heroVideoUrl'] ?? '', $data['heroVideoOpacity'] ?? 100, $data['heroTextColor'] ?? '#ffffff',
            $data['heroTextPosition'] ?? 'left', $data['heroTitleSize'] ?? 6.8, $data['heroImageSize'] ?? 90,
            $data['heroImageX'] ?? 0, $data['heroImageY'] ?? 0, 
            json_encode($data['stats'] ?? []), json_encode($data['socials'] ?? []), json_encode($data['tools'] ?? []),
            $data['contactEmail'] ?? 'datcloud20@gmail.com', $data['whatsappNumber'] ?? ''
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'get_projects':
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY date DESC");
        $projects = $stmt->fetchAll();
        foreach ($projects as &$p) {
            $p['tags'] = json_decode($p['tags'], true) ?: [];
            $p['tools'] = json_decode($p['tools'], true) ?: [];
            $p['thumbnailUrl'] = $p['thumbnail_url'];
            $p['mediaUrl'] = $p['media_url'];
            $p['liveUrl'] = $p['live_url'];
            $p['githubUrl'] = $p['github_url'];
        }
        echo json_encode($projects);
        break;

    case 'add_project':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO projects (id, title, description, category, tags, thumbnail_url, media_url, tools, status, price, client, live_url, github_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id, 
            $data['title'] ?? 'Untitled', 
            $data['description'] ?? '', 
            $data['category'] ?? 'Video Editing', 
            json_encode($data['tags'] ?? []), 
            $data['thumbnailUrl'] ?? '', 
            $data['mediaUrl'] ?? '', 
            json_encode($data['tools'] ?? []), 
            $data['status'] ?? 'Published', 
            $data['price'] ?? 0,
            $data['client'] ?? '', 
            $data['liveUrl'] ?? '', 
            $data['githubUrl'] ?? ''
        ]);
        echo json_encode(['id' => $id, 'success' => true]);
        break;

    case 'update_project':
        $id = $_GET['id'] ?? '';
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        if (!$id) {
            echo json_encode(['error' => 'Missing Project ID']);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE projects SET 
            title = ?, description = ?, category = ?, tags = ?, thumbnail_url = ?, 
            media_url = ?, tools = ?, status = ?, price = ?, client = ?, 
            live_url = ?, github_url = ? WHERE id = ?");
        $stmt->execute([
            $data['title'] ?? '', 
            $data['description'] ?? '', 
            $data['category'] ?? '', 
            json_encode($data['tags'] ?? []), 
            $data['thumbnailUrl'] ?? '', 
            $data['mediaUrl'] ?? '', 
            json_encode($data['tools'] ?? []), 
            $data['status'] ?? 'Published', 
            $data['price'] ?? 0, 
            $data['client'] ?? '', 
            $data['liveUrl'] ?? '', 
            $data['githubUrl'] ?? '', 
            $id
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'delete_project':
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    case 'get_messages':
        $stmt = $pdo->query("SELECT * FROM messages ORDER BY date DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'add_message':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO messages (id, name, email, service, content) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $data['name'] ?? '', $data['email'] ?? '', $data['service'] ?? '', $data['content'] ?? '']);
        echo json_encode(['success' => true]);
        break;

    case 'delete_message':
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Invalid Action']);
        break;
}
?>