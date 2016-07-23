						
<?php
$action=$_REQUEST['action'];
if ($action=="")    /* display the contact form */
    {
    ?>
    <html>
    <head>
    <title>PokeMap - Report a bad location</title>
    </head>
    <body>
    <script src="js/fb-search.js"></script>
    <form  action="" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="action" value="submit">
    Your ID:<br>
    <input id="userFacebookId" name="name" type="text" value="" size="30" readonly/><br>
    Your report, please include submit id and reason:<br>
    <textarea name="message" rows="7" cols="30"></textarea><br>
    <input type="submit" value="Send report"/>
    </form>
    <?php
    } 
else                /* send the submitted data */
    {
    $name=$_REQUEST['name'];
    $message=$_REQUEST['message'];
    if (($name=="")||($message==""))
        {
		echo "All fields are required, please fill <a href=\"\">the form</a> again.";
	    }
    else{		
	    $from="From: $name<$email>\r\nReturn-path: $email";
        $subject="Bad co-ords";
		mail("admin@pokemap.net", $subject, $message, $from);
		echo "Report sent! <a href='search.php'>Return</a>";
	    }
    }  
?>
						

</body>
</html>