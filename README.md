# picgo-plugin-squoosh

为[PicGo](https://github.com/Molunerfinn/PicGo)开发的插件

* 使用[@squoosh/lib](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh)压缩图片
* 使用图片md5进行重命名

## 配置

* 初次使用前请进行配置
* `开`表示压缩相应扩展名的图片，反则反之
* `开`表示使用图片md5进行重命名（与压缩相互独立）
* 使用squoosh的默认压缩配置，若想定制请修改`index.js`里的`DefaultEncodeOptions`

