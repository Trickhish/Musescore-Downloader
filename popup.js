document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  const statusDiv = document.getElementById('status');
  
  // Function to show status messages
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
    
    // Hide status after 3 seconds for success/error messages
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
  
  // Check if we're on a MuseScore page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (!currentTab.url.includes('musescore.com')) {
      downloadBtn.disabled = true;
      showStatus('This extension only works on MuseScore.com', 'error');
      return;
    }
    
    showStatus('Ready to download', 'info');
  });
  
  // Handle download button click
  downloadBtn.addEventListener('click', function() {
    downloadBtn.disabled = true;
    showStatus('Initiating download...', 'info');
    
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      // Send message to content script
      chrome.tabs.sendMessage(
        activeTab.id,
        {action: 'downloadSheet'},
        function(response) {
          downloadBtn.disabled = false;
          
          if (chrome.runtime.lastError) {
            showStatus('Error: Could not communicate with page', 'error');
            console.error('Runtime error:', chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            showStatus(response.message || 'Download initiated successfully!', 'success');
          } else {
            showStatus(response?.message || 'Download failed', 'error');
          }
        }
      );
    });
  });
});