$( document ).ready( function() {
  
  var id = location.href.split( "#" )[1];
  var url = encodeURI( location.href.split( "client" )[0] + "target/target-script-min.jshash" + id );
  $( "body" ).append( '<img class="qr" src="https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + url + '" /><img class="reaction" src="http://i.imgur.com/eQsuN.gif" />' )
             .on( "click", "li", function() {
               $( ".reaction" ).addClass( "show" );
             });
});