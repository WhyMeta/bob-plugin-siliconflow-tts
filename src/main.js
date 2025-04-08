var config = require('./config.js');
var utils = require('./utils.js');

function supportLanguages() {
  return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function pluginValidate(completion) {
  (async () => {
    try {
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

      const resp = await $http.request({
        method: "GET",
        url: `${$info.apiUrl}/v1/audio/voice/list`,
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
      url: `${$info.apiUrl}/v1/audio/speech`,
      header: {
        'Authorization': `Bearer ${$option.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'FunAudioLLM/CosyVoice2-0.5B',
        input: originText,
        voice: `fishaudio/fish-speech-1.4:${$option.voice}`,
        speed: parseFloat($option.speed),
        gain: parseFloat($option.gain),
        response_format: "mp3",
        stream: true
      },
      handler: function (resp) {
        if (resp.error) {
          $log.error(`TTS请求失败: ${resp.error}`);
          completion({
            error: {
              type: "network",
              message: `TTS请求失败: ${resp.error.message || "未知错误"}`
            }
          });
          return;
        }

        if (!resp.rawData) {
          completion({
            error: {
              type: "data",
              message: "未收到音频数据"
            }
          });
          return;
        }

        // let audioData = $data.fromData(resp.rawData);
        completion({
          result: {
            type: 'base64',
            value: resp.rawData.toBase64(),
            raw: {}
          }
        });
      }
    });
  } catch (e) {
    $log.error(`TTS处理异常: ${e}`);
    completion({
      error: {
        type: "exception",
        message: `TTS处理异常: ${e.message || "未知错误"}`
      }
    });
  }
}

function pluginTimeoutInterval() {
  return parseInt($option.timeout) || 60;
}

exports.supportLanguages = supportLanguages;
exports.tts = tts;
exports.pluginValidate = pluginValidate;
exports.pluginTimeoutInterval = pluginTimeoutInterval;