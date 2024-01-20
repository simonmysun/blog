---
layout: post
title: fontconfig 很重要
language: zh-CN
place: Trieste, Italy
---

在意大利新装了一个 Linux 系统，结果发现在浏览器里没有特殊样式的情况下“一”有时会以黑体渲染，有时会以宋体渲染。我的第一反应是可能其中一个“一”是什么奇怪的 unicode 字符，然而不是。检查了一下
locale、桌面环境和浏览器字体设置也没看出什么。一个稳定可复现的例子是在我这里访问：

```html
data:text/html,<!DOCTYPE html><html%20lang="en"%20contenteditable><head><meta charset="utf-8"></head><body>%E8%A2%AB%E4%B8%80x%E4%B8%80%E4%B8%80%E4%BA%8C%E4%B8%80</body></html>
```

于是在 TUNA 群里问了一下，引发了热心群友们的讨论。有群友怀疑是奇怪的合字，但是不应该，汉字跟拉丁字母不会合字；有群友认为有群友认为是字体 fallback 的问题。有群友建议看看 DevTools，看了一下果然用了奇怪的字体渲染。以上面的例子来说，DevTools 告诉我：

```plaintext
Rendered Fonts
  Noto Serif Tangut — Local file(3 glyphs)
  Noto Sans CJK JP — Local file(3 glyphs)
  Liberation Serif — Local file(1 glyph)
```

我的浏览器字体是默认的系统字体，是 Noto Sans CJK SC，怎么变成 JP 了？还有 Tangut 又是怎么来的？这里也没有党项语呀。

有群友建议把 `lang` 改成 `zh`，改了以后确实字体都是黑体了。有群友帮忙转发到了一个字体讨论群（后来我也加入了这个群），里面专业的群友 @oldherl 等给出了专业的解答。

原理是基于 chromium 的应用会尝试分词和猜测语言，前面的字母使后面的“一”被分到了不同的上下文。而 Noto Serif Tangut 字体里包括“西夏宋一体”几个汉字（或许还有别的？），字母后的“一”在它的分类器里被归为了西夏文，于是被使用 Noto Serif Tangut 字体渲染。而其它应用则不会出现不一致的字体渲染，每种字符只会以固定的字体渲染。在我这里基于 Chromium 的应用果然都有一样的效果，而终端（xfce4-terminal）等应用则坚持把所有的“西”、“夏”、“宋”、“一”、“体”渲染为宋体。

至于为什么 Noto Serif Tangut 会包括这几个汉字，是因为很多地方会显示以该字体显示的字体名称。看来是为了使非西夏文使用者也能方便地排版西夏文文档，这样他们选择字体的时候不需要懂西夏文也可以看懂是什么字体。

解决方案则是调整 fontconfig，中文字符被 fallback 到日文字体其实比较常见，但字体以不一致的方式渲染我第一次见。看上去不起眼的错误实际上涉及到复杂的底层机制和语言、文化背景。