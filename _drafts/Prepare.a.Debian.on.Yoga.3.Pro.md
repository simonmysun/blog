# 继续在 Yoga 3 Pro 上使用 Debian

于是去找[之前写的安装脚本](https://gist.github.com/simonmysun/79a49b609be0df3cea52). 然而 gist 被墙了, 手机翻墙也卡得要死, 然后凭记忆配好了 Shadowsocks(好在 Shadowsocks 是如此的简洁易用). 在丢包率超过 70% 的网络环境下下载了 Chrome, 装上 *pnso 的浏览器插件, 电脑就算装完一半了. 装系统的过程中也暴露了安装脚本所没有覆盖的很多问题, 比如没有把自己加入 root, 没有安装 `sudo`, 下载 `Chrome*.deb` 的时候 `wget` 没有加 `-c`, 没有自动配置 `CAPS` 和 `CTRL` 的交换等.

系统设置还是要改不少东西的, 比如 “Display Compositing” 如果不打开, 就会有非常绚丽的窗口动画(误). 还有 DPI 相关的设置也要调一下, 但相比于上一次安装, 这次需要改动的地方越来越少.


装系统的另一半功夫, 就是在无线网卡驱动上了. 已然忘光了上次怎么装好的了, 只记得[有篇博客](http://ytliu.info/blog/2014/11/19/install-kali-linux-in-lenovo-yoga-3-pro/)记录了在同样的电脑上装 Kali 的过程. 遵循此文, 发现忘了加 non-free 源. 不知道是不是装了 Chrome 的原因, 更新包列表的时候会去访问 `dl.google.com`, 但不知为何网速极快就没仔细研究. 安装好 `broadcom-sta-dkms` 之后, 尝试查看 `wl` 驱动却并没有结果.

重启了一下有了.

因为用着 Xfce, 所以装上了 WICD. 然而 WICD 找不到我家的隐藏的 WiFi 网络. 为此我还研究了一下 SSID, BSSID, ESSID 的区别, 但并没有什么用处. 因为懒, 就在家接网线上网.

最后就是稍微配置配置各种软件, 这样电脑就能用了.

VLC 全屏播放会卡, WebGL 能用, 但是 Three.js 那几个 demo 基本上都一秒一帧的水平.

---

这篇草稿不会更新了，因为后来我换了 Arch Linux。Arch Linux 为我节省了许多青春。
