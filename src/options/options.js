// Saves options to chrome.storage
function save_options() {
  var option = document.getElementById('optionsBox').value;
  var check = document.getElementById('check').checked;
  chrome.storage.sync.set({
    pickedOption: option,
    checkBox: check
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    pickedOption: '1',
    checkBox: false
  }, function(items) {
    document.getElementById('optionsBox').value = items.favoriteColor;
    document.getElementById('check').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
