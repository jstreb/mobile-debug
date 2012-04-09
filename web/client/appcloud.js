$( document ).ready( function() {
  
  var id = location.href.split( "#" )[1];
  var url = location.href.split( "client" )[0] + "target/target-script-min.js#" + id;
  alert( url );
  $( "body" ).append( '<img class="qr" src="https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + url + '" />' );
  
});