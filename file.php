<?php
$servername = "localhost";
$database = "aqq20434_base";
$username = "aqq20434_admin";
$password = "tuleniik1986";
// Устанавливаем соединение
$conn = mysqli_connect($servername, $username, $password, $database);
// Проверяем соединение
if (!$conn) {
      die("Connection failed: " . mysqli_connect_error());
}
 
echo "Connected successfully";
 
$sql = "INSERT INTO MYtable (winer, loser, count, tie, symbol) VALUES ('{$_POST['winer']}', '{$_POST['loser']}', '{$_POST['count']}', '{$_POST['tie']}', '{$_POST['symbol']}')";
if (mysqli_query($conn, $sql)) {
      echo "New record created successfully";
} else {
      echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}
mysqli_close($conn);
?>