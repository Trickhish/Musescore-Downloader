console.log('MuseScore Downloader content script loaded');


function fgca(url, hds, s, e=function(){}) {
    var rq = new XMLHttpRequest();
    rq.open('GET', url, true);
    rq.withCredentials = true;

    for (var [hk, hv] of Object.entries(hds)) {
        rq.setRequestHeader(hk, hv);
    }

    rq.onload = function() {
        var r = rq.responseText;
        s(r, rq.status);
    };
    rq.onerror = e;

    rq.send();
}

function getaw(p, hds={}, params={}) {
    var pt="";
    for (var [pk, pv] of Object.entries(params)) {
        if (pt=='') {
            pt="?";
        } else {
            pt+="&";
        }
        pt+=pk+"="+encodeURIComponent(pv);
    }

    return new Promise(function (resolve, reject) {
        fgca(p+pt, hds, (r, sc)=> {
            if (sc>=200 && sc<=299) { // success
                resolve(JSON.parse(r));
            } else {
                reject(r, sc);
            }
        }, (err)=> { // error : maybe no internet
            console.log("error: ",err);
        });
    });
}







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
    //var imgs = Array.from(document.querySelectorAll("#jmuse-scroller-component img"));
    //var links = imgs.map(e => e.src);
    //console.log(links);
    var path = window.location.pathname;
    const scoreRegex = /\/user\/(\d+)\/scores\/(\d+)/;

    if (!scoreRegex.test(path)) {
        return(false);
    }
    const user_id = path.match(/\/user\/(\d+)\/scores/)[1];
    const score_id = path.match(/\/scores\/(\d+)\/?/)[1];

    console.log(user_id, score_id);

    var r = await fetch(`https://musescore.com/api/jmuse?id=${score_id}&index=0&type=img`, {
        headers: {
            "authorization": "1aa1",
            "x-mu-frontend-ver": "mu-web_app_0.56.10",
            "x-mu-unified-id": "1.1751122425.857024242"
        },
        credentials: 'include'
    });

    /*var r = await getaw("https://musescore.com/api/jmuse", {
        "accept": "*",
        "accept-language": "fr-FR,fr;q=0.9,en;q=0.8,ja;q=0.7",
        "authorization": "1aa1",
        "x-mu-frontend-ver": "mu-web_app_0.56.10",
        "x-mu-unified-id": "1.1751122425.857024242"
    }, {
        "id": score_id,
        "index": 0,
        "type": "img"
    });*/
    console.log(r);

    return(true);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadSheet') {
        console.log('Download request received');
        var r = tryWait(dlSheet, sendResponse);
    }


    return true;
});