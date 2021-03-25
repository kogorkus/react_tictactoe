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
 
$JSON = json_decode(file_get_contents('php://input'),true);
var_dump($JSON); 
file_put_contents('debug.txt',var_export($JSON,true).PHP_EOL,FILE_APPEND);

echo "Connected successfully";


$query = mysqli_query($conn, "SELECT 1 FROM MYtable WHERE winer = '{$JSON["winer"]}' AND loser = '{$JSON["loser"]}' AND symbol = '{$JSON["symbol"]}'");
$result = mysqli_fetch_assoc($query);


if(mysqli_fetch_assoc(mysqli_query($conn, "SELECT 1 FROM MYtable WHERE winer = '{$JSON["winer"]}' AND loser = '{$JSON["loser"]}' AND symbol = '{$JSON["symbol"]}'"))[1]) {
	$sql = "UPDATE MYtable SET count = count + '{$JSON["count"]}', tie = tie + '{$JSON["tie"]}' WHERE winer = '{$JSON["winer"]}' AND loser = '{$JSON["loser"]}' AND symbol = '{$JSON["symbol"]}'";
} else {
	$sql = "INSERT INTO MYtable (winer, loser, count, tie, symbol) VALUES ('{$JSON["winer"]}', '{$JSON["loser"]}', '{$JSON["count"]}', '{$JSON["tie"]}', '{$JSON["symbol"]}')";
}

if (mysqli_query($conn, $sql)) {
      echo "New record created successfully";
      echo "hui";
      echo $result[1];
      foreach($result as $myarr)
		{
  		echo $myarr."<br />";
		}
	echo var_export($result);	
} else {
      echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}
mysqli_close($conn);
?>