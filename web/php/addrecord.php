<?php
require_once __DIR__ . '/facebook-sdk/src/Facebook/autoload.php';
 
session_start();

$fb = new Facebook\Facebook([
  'app_id' => 'YOUR FACEBOOK APP ID HERE',
  'app_secret' => 'YOUR FACEBOOK APP SECRET HERE',
  'default_graph_version' => 'v2.6',
  ]);

$helper = $fb->getJavaScriptHelper();

try {
  $accessToken = $helper->getAccessToken();
} catch(Facebook\Exceptions\FacebookResponseException $e) {
  echo "Facebook Error: Graph returned an error" . $e->getMessage();
  exit;
} catch(Facebook\Exceptions\FacebookSDKException $e) {
  echo "Facebook Error: SDK returned an error" . $e->getMessage();
  exit;
}

if (! isset($accessToken)) {
  echo "Facebook Error: No cookie set or no OAuth data could be obtained from cookie.";
  exit;
}

// Logged in
//echo '<h3>Facebook Access Token</h3>';
//var_dump($accessToken->getValue());

//$_SESSION['fb_access_token'] = (string) $accessToken;

// User is logged in!
// You can redirect them to a members-only page.
//header('Location: https://example.com/members.php');




	require("dbinfo.php");

    $link = mysqli_connect("$host", "$username", "$password", "$database");

    // Check connection
    if($link === false){
        die("Error: Could not connect to database. Please inform site staff. " . mysqli_connect_error());
    }


    // Escape user inputs for security
    $FacebookId 	= 	mysqli_real_escape_string($link, $_POST['postFacebookId']);
    $Latitude 		= 	mysqli_real_escape_string($link, $_POST['postLatitude']);
	$Longitude 		= 	mysqli_real_escape_string($link, $_POST['postLongitude']);
	$Selection 		= 	mysqli_real_escape_string($link, $_POST[postSelection]);
	$Description 	= 	mysqli_real_escape_string($link, $_POST['postDescription']);


    // Attempt insert query execution
    if(preg_match('/^[a-zA-Z0-9 ]+$/', $Description)) {
    	$sql = "INSERT INTO pokemarkers (`lat`, `lng`, `pokeid`, `submitby`, `desc`) 
    		VALUES ($Latitude, $Longitude, $Selection, $FacebookId, '$Description')";
    } else {
    	echo "Error: Description only allows for characters a-z, A-Z and 0-9";
    }	
    

    if(mysqli_query($link, $sql)){
        echo "SUCCESS: Record added";
    } 
    else {
        echo "SQL ERROR: Could not execute";// $sql. <br /><a href='http://www.pokemap.net/search.php'>Return</a>" . mysqli_error($link);
    }



    // Close connection
    mysqli_close($link);

?>