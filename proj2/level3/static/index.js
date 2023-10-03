function chooseTab(num) {
  // Dynamically load the appropriate image.
  let index = parseInt(num);
  var html = "Image " + index + "<br>";
  html += "<img src='../static/cloud" + index + ".jpg' />";
  $("#tabContent").html(html);

  window.location.hash = num;

  // Select the current tab
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].id == "tab" + parseInt(num)) {
      tabs[i].className = "tab active";
      } else {
      tabs[i].className = "tab";
    }
  }

  // Tell parent we've changed the tab
  top.postMessage(self.location.toString(), "*");
}

window.onload = function() { 
  chooseTab(unescape(self.location.hash.substr(1)) || "1");
}

// Extra code so that we can communicate with the parent page
window.addEventListener("message", function(event){
  if (event.source == parent) {
    chooseTab(unescape(self.location.hash.substr(1)));
  }
}, false);

// event listener for choose tab
document.addEventListener('click', function(e) {
  if (e.target.id && e.target.className == 'tab') {
    chooseTab(e.target.id.substr(3));
  }
} );