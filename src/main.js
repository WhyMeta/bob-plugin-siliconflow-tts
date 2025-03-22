var config = require('./config.js');
var utils = require('./utils.js');

function supportLanguages() {
  return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function pluginValidate(completion) {
  (async () => {
      try {
          // Check if API key is provided
          if (!$option.apiKey) {
              completion({
                  result: false,
                  error: {
                      type: "secretKey",
                      message: "请输入您的 Siliconflow API Key",
                      troubleshootingLink: "https://bobtranslate.com/faq/"
                  }
              });
              return;
          }

          // Make a test request to get voices (lightweight API call)
          const resp = await $http.request({
              method: "GET",
              url: `${$option.apiUrl}/v1/audio/voice/list`,
              header: {
                  'Authorization': `Bearer ${$option.apiKey}`
              }
          });

          if (resp.response.statusCode === 200) {
              completion({ result: true });
          } else {
              completion({
                  result: false,
                  error: {
                      type: "secretKey",
                      message: "Invalid API key",
                      troubleshootingLink: "https://bobtranslate.com/faq/"
                  }
              });
          }
      } catch (err) {
          completion({
              result: false,
              error: {
                  type: "network",
                  message: "Failed to validate API key: " + (err.message || "Unknown error"),
                  troubleshootingLink: "https://bobtranslate.com/faq/"
              }
          });
      }
  })();
}

function tts(query, completion) {
  const targetLanguage = utils.langMap.get(query.lang);
  if (!targetLanguage) {
    const err = new Error(`不支持 ${query.lang} 语种`);
    throw err;
  }
  const originText = query.text;

  try {
    $http.request({
      method: 'POST',
      url: `${$option.apiUrl}/v1/audio/speech`,
      header: {
        'Authorization': `Bearer ${$option.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'FunAudioLLM/CosyVoice2-0.5B',
        input: originText,
        voice: `FunAudioLLM/CosyVoice2-0.5B:${$option.voice}`,
        speed: parseFloat($option.speed),
        gain: parseFloat($option.gain),
        // response_format: "mp3",
        stream: true
      },
      handler: function (resp) {
        // Convert response to base64
        let audioData = $data.fromData(resp.rawData);
        var rawData = resp.data.audio_data;
        completion({
          result: {
            type: 'base64',
            value: audioData.toBase64(),
            raw: {}
          }
        });
      }
    });
  } catch (e) {
    $log.error(e);
  }
}

exports.supportLanguages = supportLanguages;
exports.tts = tts;