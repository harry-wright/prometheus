<!DOCTYPE html>
<html>
	<head>
		<title>PokeMap - Pokemon GO Locations</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="Pokemon GO Locations">
		<meta name="keywords" content="pokemap, pokemon go locations, pokemon go map, pokestop locations, pokemon go gym locations">
		<link rel="icon" type="image/png" href="/img/pokemark.ico" />
		<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
		<link rel="stylesheet" type="text/css" href="css/search.css" />
		<link href='https://fonts.googleapis.com/css?family=Roboto:400,900' rel='stylesheet' type='text/css'>
	</head>
<body>
	<!-- 1.12 needed for modals -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
	<script><?php
	require 'php/packer.php';
	error_reporting(E_ALL);
	$js = file_get_contents(__DIR__ . '/' . '/js/location.js');
	$packer = new Tholu\Packer\Packer($js, 'Normal', true, false, true);
	$packed_js = $packer->pack();
	echo $packed_js; ?>
	;</script>
	<script src="js/fb-search.js"></script>
	<div id="navwrapper">
		<div id="trinav">
			<div class="column">
				<a class="glyphicon glyphicon-map-marker" href="javascript:void(0)" data-toggle="modal" data-target="#modalLocation"></a>
			</div>
			<div class="column">
				<a class="glyphicon glyphicon-search" href="javascript:void(0)" data-toggle="modal" data-target="#modalSearch"></a>
			</div>
			<div class="column">
				<a class="glyphicon glyphicon-plus" href="javascript:void(0)" data-toggle="modal" data-target="#modalSubmit"></a>
			</div>
			<div class="column">
				<a class="glyphicon glyphicon-user" href="javascript:void(0)" data-toggle="modal" data-target="#modalAccount"></a>
			</div>
		</div>
		<div id="map"></div>			
	</div>
	<div id="modalLocation" class="modal fade" role="dialog">
		<div class="vertical-alignment-helper">
			<div class="modal-dialog vertical-align-center">
				<!-- Modal content-->
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">&times;</button>
						<h4 class="modal-title">My Location</h4>
					</div>
					<div class="modal-body">
						<button type="button" class="btn btn-primary btn-block" onclick="tryGeolocation()">Relocate</button>
						<hr />
						<fieldset class="form-group">
							<label for="radiusSelect">Search your radius</label>
							<select class="form-control" id="radiusSelect">
								<option value="5">5 miles</option>
								<option value="10">10 miles</option>
								<option value="15">15 miles</option>
								<option value="20">20 miles</option>
								<option value="25">25 miles</option>
								<option value="50">50 miles</option>
								<option value="100" selected>100 miles</option>
							</select>
						</fieldset>
						<button type="button" class="btn btn-primary btn-block" onclick="searchLocations()">Search</button>
						<hr />
						<label for="locationSelect">Search results</label>
						<select class="form-control" id="locationSelect" value="">
							<option>Results are shown here</option>
						</select>
						<hr />
						<a href="report.php" target="_blank">Report a bad co-ordinate</a>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="modalSubmit" class="modal fade" role="dialog">
		<div class="vertical-alignment-helper">
			<div class="modal-dialog vertical-align-center">
				<!-- Modal content-->
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">&times;</button>
						<h4 class="modal-title">Submit</h4>
					</div>
					<div class="modal-body">
						<form action="php/addrecord.php" method="post" id="userSubmitLocation">
							<fieldset class="form-group">
								<label for="userFacebookId">Facebook User ID</label>
								<input type="text" class="form-control" id="userFacebookId" name="postFacebookId" placeholder="Not logged in to Facebook" required readonly>
								<small class="text-muted">You must be logged in to Facebook to continue</small>
							</fieldset>
							<fieldset class="form-group">
								<label for="userPokemonSelect">Latitude Found</label>
								<input type="text" class="form-control" id="userLatitude" name="postLatitude" placeholder="No latitude provided" required>
							</fieldset>
							<fieldset class="form-group">
								<label for="userPokemonSelect">Longitude Found</label>
								<input type="text" class="form-control" id="userLongitude" name="postLongitude" placeholder="No longitude provided" required>
							</fieldset>
							<fieldset class="form-group">
								<label for="userPokemonSelect">I found...</label>
								<select class="form-control" form="userSubmitLocation" id="userSelect" name="postSelection" required>
<?php include 'php/optionslist.php';?>
							
								</select>
								<small class="text-muted">The 20 most common Pokemon have been disabled</small>
							</fieldset>
							<fieldset class="form-group">
								<label for="userDescription">Description</label>
								<textarea class="form-control" id="userDescription" name="postDescription" rows="1" placeholder="Description required!" required></textarea>
								<small class="text-muted">Characters a-z, A-Z and 0-9 allowed</small>
							</fieldset>
							<div id="form-messages"></div>
							<button type="submit" class="btn btn-primary" onclick="FB.getLoginStatus();">Add to Map</button>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="modalAccount" class="modal fade" role="dialog">
		<div class="vertical-alignment-helper">
			<div class="modal-dialog vertical-align-center">
				<!-- Modal content-->
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">&times;</button>
						<h4 class="modal-title">Account</h4>
					</div>
					<div class="modal-body">
						<!-- image for iframe workaround -->
						<div id="pic"><img id="profpic" src="/img/notloggedin.png" /></div><br />
						<div id="status">&nbsp;</div><br />
						<fb:login-button data-size="xlarge" scope="public_profile,email" data-auto-logout-link="true" onlogin="checkLoginState();">
						</fb:login-button>
						 <!--<button type="button" class="btn btn-primary btn-block" onclick="logoutUser()">Log Out</button>-->
						<div id="legal"><br />Images & names © 1995-2016 Niantic Labs/Nintendo/Game Freak</div><hr />
						<a href="http://www.pokemap.net" target="_blank">Sign in at PokeMap.net</a>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="modalSearch" class="modal fade" role="dialog">
		<div class="vertical-alignment-helper">
			<div class="modal-dialog vertical-align-center">
				<!-- Modal content-->
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">&times;</button>
						<h4 class="modal-title">Search</h4>
					</div>
					<div class="modal-body">
						Search coming soon
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<script src="https://maps.googleapis.com/maps/api/js?key=YoURkEyHeRE" defer></script>
	<!-- 2.x needed for listening -->
	<!--<script src="https://code.jquery.com/jquery-2.x-git.min.js"></script>-->
	<script src="js/app.js"></script>
</body>
</html>