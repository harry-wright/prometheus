<!DOCTYPE html>
<html lang="en">
<head>
	<title>PokeMap - Pokemon GO Locations</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Pokemon GO Locations">
    <meta name="keywords" content="pokemap, pokemon go locations, pokemon go map, pokestop locations, pokemon go gym locations">
    <link rel="icon" type="image/png" href="/img/pokemark.ico" />
    <!-- Bootstrap Core CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/index.css" rel="stylesheet">
    <!-- Custom Fonts -->
	<link href='https://fonts.googleapis.com/css?family=Roboto:400,900' rel='stylesheet' type='text/css'>
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>
	<script>
	  // This is called with the results from from FB.getLoginStatus().
	  function statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);
		// The response object is returned with a status field that lets the
		// app know the current login status of the person.
		// Full docs on the response object can be found in the documentation
		// for FB.getLoginStatus().
		if (response.status === 'connected') {
		  // Logged into your app and Facebook.
		  goSearch();
		} else if (response.status === 'not_authorized') {
		  // The person is logged into Facebook, but not your app.
		  document.getElementById('status').innerHTML = 'Please log ' +
			'into this app.';
		} else {
		  // The person is not logged into Facebook, so we're not sure if
		  // they are logged into this app or not.
		  document.getElementById('status').innerHTML = 'Please log ' +
			'into Facebook.';
		}
	  }

	  // This function is called when someone finishes with the Login
	  // Button.  See the onlogin handler attached to it in the sample
	  // code below.
	  function checkLoginState() {
		FB.getLoginStatus(function(response) {
		  statusChangeCallback(response);
		});
	  }

	  window.fbAsyncInit = function() {
	  FB.init({
		appId      : 'YOUR FACEBOOK APP ID HERE',
		cookie     : true,  // enable cookies to allow the server to access 
							// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.6' // use graph api version 2.5
	  });

	  // Now that we've initialized the JavaScript SDK, we call 
	  // FB.getLoginStatus().  This function gets the state of the
	  // person visiting this page and can return one of three states to
	  // the callback you provide.  They can be:
	  //
	  // 1. Logged into your app ('connected')
	  // 2. Logged into Facebook, but not your app ('not_authorized')
	  // 3. Not logged into Facebook and can't tell if they are logged into
	  //    your app or not.
	  //
	  // These three cases are handled in the callback function.

	  FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	  });

	  };

	  // Load the SDK asynchronously
	  (function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	  }(document, 'script', 'facebook-jssdk'));

	  // Here we run a very simple test of the Graph API after login is
	  // successful.  See statusChangeCallback() for when this call is made.
	  function goSearch() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me?fields=id,name,email,permissions', function(response) {
		  console.log('Successful login for: ' + response.name);
		  //document.getElementById('status').innerHTML =
			//'Thanks for logging in, ' + response.name + '!';
			// Redirects to dashboard
			window.location = "/search.php";

		});
	  }
	</script>
	<header id="top" class="header">
		<div class="text-vertical-center">
			<h1>PokeMap</h1>
			<h3>Alpha Build 13</h3>
			<br>
			<!--<a id="fbloginbutton" href="javascript:void(0)" onclick="FB.login();" class="btn btn-dark btn-lg">Login with Facebook</a>-->
			<fb:login-button data-size="xlarge" scope="public_profile,email" onlogin="checkLoginState();">
			</fb:login-button>
			<br />
			<h5 id="status">&nbsp</h5>
			<h5 id="reminders">
				<div style="color:green !important;">
					<span class="glyphicon glyphicon-thumbs-up"></span><br />
					18,000 database entries 17/07/2016<br />
				</div>
			<span class="glyphicon glyphicon-warning-sign"></span><br />
			Location services, Javascript and Facebook must be enabled<br />
			Images & names © 1995-2016 Niantic Labs/Nintendo/Game Freak<br />
			PokeMap is run as a non-profit for educational and research purposes<br />
			</h5>
		</div>
	</header>
</body>
</html>
