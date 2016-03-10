var Spotify = require('spotify-web');
var s = require( 'child_process' ).spawn;
var progress = require( 'progress');

// determine the URI to play, ensure it's a "track" URI
//var uri = process.argv[4] || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';
var uri = 'spotify:track:4pSbdUWj7FrZRjgxQOISIL';
var type = Spotify.uriType(uri);
if ('track' != type) {
  throw new Error('Must pass a "track" URI, got ' + JSON.stringify(type));
}

var player = s( 'aucat', [ '-i', '-' ] );
var decoder = s( 'mpg123', [ '-s', '-' ] );

// initiate the Spotify session
Spotify.login( process.env['S_USER'], process.env['S_PASS'], function (err, spotify) {
  if (err) throw err;

  // first get a "Track" instance from the track URI
  spotify.get(uri, function (err, track) {
    if (err) throw err;
    console.log('Playing: %s - %s', track.artist[0].name, track.name);


	var bar;

	var len = 0;
	decoder.stdout.on( 'data', function( data ) {
		player.stdin.write( data );
		len++;
	});

	player.on( 'close', function() {
		console.log( 'closing player' );
		player.stdout.end();
		spotify.disconnect();
		process.exit();
	});

	decoder.on( 'close', function() {

		console.log( 'Length is:', len );

		bar = new progress( '[:bar] :percent', {
			complete: '=',
			incomplete: '-',
			width: 100,
			total: track.duration
		});

		decoder.stdout.end();
		decoder.stdin.end();
		player.stdin.end();
	});

	track.play()
		.pipe(decoder.stdin)
		.on('finish', function () {
	});

  });
});
