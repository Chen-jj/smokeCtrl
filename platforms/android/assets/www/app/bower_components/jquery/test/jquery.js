// Use the right jQuery source in iframe tests
document.write( "<script id='jquery-scripts' src='" +
	parent.document.getElementById("jquery-scripts").src.replace( /^(?![^\/?#]+:)/,
		parent.location.pathname.replace( /[^\/]$/, "$0/" ) ) +
"'><\x2Fscript>" );
