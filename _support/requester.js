const requester = function () {
  const requester = new XMLHttpRequest()
  return function ( method, url, callback ) {
    requester.onreadystatechange = function () {
      if ( requester.readyState === 4 ) {
        callback( requester.responseText )
      }
    };
    requester.open( method, url )
    requester.send()
  }
}()
