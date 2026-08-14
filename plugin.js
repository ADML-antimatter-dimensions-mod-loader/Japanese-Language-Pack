
(function() {
  const dictionary = {
    "Antimatter Dimensions": "反物質ディメンション",
    "The Reality Update": "リアリティアップデート",
    "Dimensions": "ディメンション",
    "Achievements": "実績",
    "Statistics": "統計",
    "Options": "オプション",
    "Automation": "自動化",
    "Infinity": "インフィニティ",
    "Eternity": "エタニティ",
    "Reality": "リアリティ",
    "Celestials": "セレスティアル",
    "Shop": "ショップ",
    "You have": "所持数:",
    "antimatter": "反物質",
    "You are getting": "毎秒生産:",
    "antimatter per second": "反物質/秒",
    "Max All (M)": "一括購入 (M)",
    "Until 10": "10個まで購入",
    "Buy 1": "購入 1",
    "Cost:": "コスト:",
    "Dimension Boost": "ディメンションブースト",
    "Antimatter Galaxies": "反物質ギャラクシー",
    "Reset your Dimensions to unlock": "ディメンションをリセットして解放",
    "Time since last save:": "前回セーブからの経過時間:",
    "Export save": "セーブをエクスポート",
    "Import save": "セーブをインポート",
    "Save game": "ゲームをセーブ",
    "Choose save": "セーブを選択",
    "Export save as file": "ファイルとしてセーブを出力",
    "Import save from file": "ファイルからセーブを読込",
    "RESET THE GAME": "ゲームをリセット",
    "Autautosave interval:": "自動セーブ間隔:"
  };

  function translateText(text) {
    if (!text) return text;
    let trimmed = text.trim();
    if (dictionary[trimmed]) {
      return text.replace(trimmed, dictionary[trimmed]);
    }
    for (const [eng, jpn] of Object.entries(dictionary)) {
      if (text.includes(eng)) {
        text = text.replaceAll(eng, jpn);
      }
    }
    return text;
  }

  function walkAndTranslate(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentNode;
      if (parent && ["SCRIPT", "STYLE", "CODE"].includes(parent.tagName)) return;
      const original = node.nodeValue;
      const translated = translateText(original);
      if (original !== translated) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (["SCRIPT", "STYLE", "CODE"].includes(node.tagName)) return;
      for (const attr of ["placeholder", "title", "aria-label", "value"]) {
        if (node.hasAttribute && node.hasAttribute(attr)) {
          const val = node.getAttribute(attr);
          const tr = translateText(val);
          if (val !== tr) node.setAttribute(attr, tr);
        }
      }
      for (const child of node.childNodes) {
        walkAndTranslate(child);
      }
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        walkAndTranslate(node);
      }
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    walkAndTranslate(document.body);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  // Also periodic scan
  setInterval(() => {
    walkAndTranslate(document.body);
  }, 1000);

  console.log("Japanese Language Pack (Expanded) loaded successfully.");
})();
