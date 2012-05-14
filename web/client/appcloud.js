$( document ).ready( function() {
  //Determine what mode we are running in.  If there is no hash value of connected=true then we hide everything on the page.
  var id = location.href.split( "#" )[1];;
  var url = encodeURI( location.href.split( "client" )[0] + "target/target-script-min.jshash" + id );;
  var connected = location.href.split( "connected=" )[1].split( "&" )[0].split( "#" )[0] === "true";
  if( !connected ) {
    $( "body" ).addClass( "notconnected" )
               .append( '<img class="qr" src="https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + url + '" /><img class="reaction" src="http://i.imgur.com/eQsuN.gif" />' )
                          .on( "click", ".qr", function() {
                            $( ".reaction" ).addClass( "show" );
                          });
  }
  
});