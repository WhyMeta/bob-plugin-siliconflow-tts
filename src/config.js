const supportedLanguages = [
    ["auto", "auto"],
    ["zh-Hans", "zh-CN"],
    ["zh-Hant", "zh-TW"],
    ["en", "en-US"],
    ["ja", "ja-JP"],
    ["ko", "ko-KR"],
    ["fr", "fr-FR"],
    ["de", "de-DE"],
    ["es", "es-ES"],
    ["it", "it-IT"],
    ["pt", "pt-PT"],
    ["ru", "ru-RU"],
    ["tr", "tr-TR"],
    ["vi", "vi-VN"],
    ["nl", "nl-NL"],
    ["pl", "pl-PL"],
    ["hi", "hi-IN"]
];

const langMap = new Map(supportedLanguages);

exports.supportedLanguages = supportedLanguages;
exports.langMap = langMap;