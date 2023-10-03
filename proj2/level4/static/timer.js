
function startTimer(seconds) {
    if (seconds == "-1") {
        window.confirm("Invalid timer value.");
        window.history.back();
        return;
    }
    seconds = parseInt(seconds) || 3;
    setTimeout(function() { 
        window.confirm("Time is up!");
        window.history.back();
    }, seconds * 1000);
}
// set document onload
window.onload = function() {
    startTimer('{{ timer }}');
}