const TEST_IMAGES_BASE64 = {
    lossy: 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    lossless: 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
    alpha: 'UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==',
    animation: 'UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA'
};

// ========== 常用函数
function isType(s, typeString) {
    return {}.toString.call(s) === `[object ${typeString}]`;
}
function isObject(s) {
    return isType(s, 'Object');
}
function isNull(s) {
    return isType(s, 'Null');
}
function storageSetItem(val) {
    localStorage.setItem(STORAGE_KEY, val);
}
function storageGetItem() {
    return localStorage.getItem(STORAGE_KEY);
}
function storageRemoveItem() {
    return localStorage.removeItem(STORAGE_KEY);
}

function load(caseItemName, cb) {
    if (!TEST_IMAGES_BASE64[caseItemName]) {
        return;
    }

    let img = new Image();
    img.onload = function () {
        cb(caseItemName, (img.width > 0) && (img.height > 0));
        img.onload = img.onerror = null;
        img = null;
    };
    img.onerror = function () {
        cb(caseItemName, false);
        img.onload = img.onerror = null;
        img = null;
    };
    img.src = `data:image/webp;base64,${TEST_IMAGES_BASE64[caseItemName]}`;
}

const localStorageSupported = (() => {
    try {
        let str = 'test' + new Date().getTime();
        localStorage.setItem(str, str);
        localStorage.removeItem(str);
        return true;
    } catch(e){
        return false;
    }
})();


// ========== 配置
const STORAGE_KEY = '_webPCheckResult';

// ========== 检查流程
let WebPCheckResult = null;

export default function WebPCheck() {
    if (!isNull(WebPCheckResult)) {
        return WebPCheckResult;
    }

    let storageResult = localStorageSupported ? JSON.parse(storageGetItem()) : false;
    if (isObject(storageResult)) {
        WebPCheckResult = {
            lossy: storageResult.lossy === true || false,
            lossless: storageResult.lossless === true || false,
            alpha: storageResult.alpha === true || false,
            animation: storageResult.animation === true || false
        };
    } else {
        let testCases = ['lossy', 'lossless', 'alpha', 'animation'];
        let caseItemName;
        let totalCheck = testCases.length;
        let currentCheck = 0;
        while (caseItemName = testCases.shift()) {
            load(caseItemName, (name, response) => {
                ++currentCheck;

                if (isNull(WebPCheckResult)) {
                    WebPCheckResult = {};
                }

                WebPCheckResult[name] = response;

                if (localStorageSupported && totalCheck === currentCheck) {
                    storageSetItem(JSON.stringify(WebPCheckResult));
                }
            });
        }
    }

    return WebPCheckResult;
}

WebPCheck.clean = () => {
    storageRemoveItem();
};
