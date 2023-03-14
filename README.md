# Stable Diffusion image metadata viewer

## Description
Show StableDiffusion generated image's metadata in .png .jpg .jpeg file tabs.

## 説明
StableDiffusionで生成された画像の埋め込みメタデータを表示します。
PNG, JPG, JPEGに対応しています。

## Usage
- Open PNG or JPG files tab
- When StableDiffusion metadata found, "Show SD metadata" button appear
- Show positive prompt, negative prompt and other info in metadata window
- To copy to clipboard, click copy button(https pages only)

## 使い方
- PNGファイルまたはJPGファイルのタブを開きます
- Stable Diffusionの埋め込みメタデータが見つかると"Show SD metadata"ボタンが表示されます
- ボタンをクリックするとpositiveプロンプト、negativeプロンプト、その他の情報が個別に表示されます
- "copy"ボタンをクリックするとそれぞれの情報をクリップボードにコピーします  
※copyボタンはブラウザAPIの制約上httpsのサイトでのみ使用できます。

## Change history
- 0.2.1 2023-03-14
  * Update styles
- 0.2.0 2023-03-14
  * Add support WebP file format
- 0.1.2 2023-02-11
  * Fix jpg file view
  * Add support NMKD generated files
- 0.1.1 2023-02-11
  * Fix determination of image extensions(thanks jyyhyy)
  * Change style for mobile

## 更新履歴
- 0.2.1 2023-03-14
  * スタイルを更新
- 0.2.0 2023-03-14
  * webpファイル形式に対応
- 0.1.2 2023-02-11
  * jpgファイルのデータが表示できなくなっていたのを修正
  * NMKDで生成されたファイルに対応
- 0.1.1 2023-02-11
  * 画像の拡張子の判定を修正(thanks jyyhyy)
  * モバイル向けにスタイルを修正
