if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("../service-worker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

// נשמור את אירוע ההתקנה במשתנה גלובלי כדי שנוכל להציגו מאוחר יותר
let deferredPrompt;
//מקשיב לקובץ עצמו כלומר לאינדקס לראות שהוא עולה ותקין
document.addEventListener("DOMContentLoaded", function (event) {
    //beforeinstallprompt
    //מקישב לדפדפן והפעולה בודקת אם יש לי את כל התנאים על מנת שיוכל להתקין את האפליקציה
    //נגיד אם אים את המיניפסט אז הוא לא יוכל לרדת או במידה וזה כבר מורד
    window.addEventListener('beforeinstallprompt', (e) => {
        // נמנע הצגה של חלון ברירת מחדל במידה וקיים
        e.preventDefault();
        // נשמור את אירוע ההוספה למשתנה
        deferredPrompt = e;
        // נציג את כפתור ההתקנה שלנו
        showInstallPromotion();
    });

    //בודק שבכלל אפשר להפעיל את הוידאו ושיש את כל התנאים בדפדפן וב navigator
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        startVideo();
    } else {
        console.log("camera not supported");
    }
});



//להציג ולהוריד את הכפתור
function showInstallPromotion() {
    //להוריד את הD-NOE
    //הורדת הקלאס גורמת לזה להפוך לנראה כי בדיפולט הוא מוסתר
    document.getElementById("install-btn").classList.remove("d-none");
}
function hideInstallPromotion() {
    document.getElementById("install-btn").classList.add("d-none");
}

//התקנת האפליקציה
//הפונקציה נקראת על ידי לחיצה על הכפתור כלומר היא רשומה על ידי הבאטן באינדקס
function installApp() {
    // נסתיר את כפתור ההתקנה
    hideInstallPromotion();
    //  מציג את חלונית ההתקנה  prompt
    //deferredPrompt המשתנה ששומר את האירוע ההתקנה
    deferredPrompt.prompt();
    // נרוקן את המשתנה בו שמרנו את האירוע, זהו אירוע חד פעמי
    deferredPrompt = null;
}
//הפעלת וידאו
//פעולה א סינכרונית
async function startVideo() {
    // נשמור את תג הוידאו לתוך משתנה
    const player = document.getElementById('player');
    // נגדיר דרישות למדיה - נרצה להציג רק וידאו מהמצלמה האחורית
    //שלוש השורות האלה אומרות שאנחנו לא רוצים אודיאו ואנחנו רוצים שהמצלמה תפעל רק מהחלק האחורי- כלומר דרישות להפעלת המצלמה
    const constraints = {
        audio: false,
        video: {
            facingMode: 'environment'
        }
    };

    //במידה ונצליח לפנות למצלמה, נזרים את הוידאו לתג הוידאו
    //נשלח את הדרישות להפעלת המצלמה
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (mediaStream) {
            player.srcObject = mediaStream;
        })
        .catch(function (err) { console.log(err.name + ": " + err.message); });
}

//צילום תמונה שמופעלת דרך ה HTML
//נרצה לגשת לאותה תגית קאנבס על מנת לשים בה את התמונה שנצלם
function doScreenshot() {
    const canvas = document.getElementById('canvas');
    // נרצה לשמור על הפרופורציות של הוידאו
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    // נצייר את הפריים הנוכחי על גבי הקנבס
    canvas.getContext('2d').drawImage(player, 0, 0);

    //נמיר את הקנבס לפורמט של תמונה 
    document.getElementById('photo')
        .src = canvas.toDataURL('image/jpeg');
    // נציג את הקנבס
    canvas.classList.remove('d-none');
};

//המרה מURL לקובץ
//הפונקציה מקבלת את הקישור והשם קובץ
function dataURLtoFile(dataUrl, fileName) {
    var arr = dataUrl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
}

//שיתוף הקובץ
function share() {
    //שליחה של השם של הקובץ והקישור והפיכתו לקובץ
    var fileToSend = dataURLtoFile(document.getElementById('photo').src, "ImageProg3.jpeg")
    //שומרת את הקטבץ כמערך עח מנת שאם נרצה לשלוח כמה תמונות נוכל לבצע זאת
    var filesArray = [fileToSend];
    //בדיקה האם ניתן לשתף והאם ניתן לשתף את הקבצים שלי
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({
            files: filesArray,
        })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
    } else {
        console.log(`Your system doesn't support sharing files.`);
    }
}
