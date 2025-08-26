console.log('MuseScore Downloader content script loaded');

async function tryWait(fct, sendResponse) {
    try {
        var r = await fct();
        sendResponse({
            success: true,
            message: ""
        });
    } catch (err) {
        console.error('Error during download:', err);
        sendResponse({
            success: false,
            message: 'Error occurred: ' + err.message
        });
    }
}

async function dlSheet() {
    var imgs = Array.from(document.querySelectorAll("#jmuse-scroller-component img"));
    var links = imgs.map(e => e.src);
    console.log(links);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadSheet') {
        console.log('Download request received');
        var r = tryWait(dlSheet, sendResponse);
    }


    return true;
});