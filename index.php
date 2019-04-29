<head>
<meta charset='UTF-8'/>
<script type='text/javascript' src='main.js'></script>
<link href="style.css" rel="stylesheet">
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<?php 
foreach (glob("game/*.js") as $filename)
{
    echo '<script type="text/javascript" src='.$filename.'></script>
';
} 
?>

<title>Pyramid Rise</title>
</head>
<body>
	<div id="wrap">
		<canvas id='game' width=800 height=600;>Your browser does not support canvas, use chrome instead.</canvas>
		<div id="ui"></div>
	</div>
</body>