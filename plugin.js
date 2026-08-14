const JAPANESE = {
  "Antimatter Dimensions": "反物質ディメンションズ",
  "Dimensions": "ディメンション",
  "Achievements": "実績",
  "Statistics": "統計",
  "Options": "オプション",
  "You have": "現在の所持量:",
  "antimatter.": "反物質。",
  "You are getting": "毎秒の獲得量:",
  "antimatter per second.": "反物質 / 秒。",
  "1st Antimatter Dimension": "第1反物質ディメンション",
  "Dimension Boost": "ディメンションブースト",
  "Antimatter Galaxies": "反物質銀河",
  "Buy 1": "1個購入",
  "Max All (M)": "すべて最大 (M)",
  "Until 10": "10個まで",
  "Cost:": "コスト:",
  "Reset your Dimensions": "ディメンションをリセット",
  "Time since last save": "前回のセーブからの経過時間"
};

class Plugin {
  constructor(api) {
    this.api = api;
  }

  onload() {
    this.api.i18n.registerPack("ja-JP", JAPANESE);
    this.api.i18n.setLocale("ja-JP");
    this.api.notify("Japanese language pack enabled.");
  }

  onunload() {
    this.api.i18n.disable();
    this.api.notify("Japanese language pack disabled.");
  }
}
