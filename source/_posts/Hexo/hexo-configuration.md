---
title: hexo个性化扩展
excerpt: '本文主要是记录博客的配置历程，包括主题配置，图片插入问题，域名配置，功能扩展等操作'
index_img: /img/post/hexo.jpg
category_bar: ["博客"]
categories: 
  - 技术栈
  - 博客
tags:
  - Hexo
date: 2025-05-25 20:56:38
updated:
sticky:
---


# 主题配置

在 [Hexo官网](https://hexo.io/themes/) 主题有很多，我考虑使用[Hexo Theme Fluid](https://hexo.fluid-dev.com/docs/guide/)主题。

为了后续自定义扩展（魔改）, 将 [最新release版本](https://github.com/fluid-dev/hexo-theme-fluid/releases)对应的主题保存到`themes`目录下,然后在博客目录下创建`_config.fluid.yml`, 将主题`_config.yml`的内容复制进去。以后如果修改任何主题配置，都直接修改`_config.fluid.yml`就好，因为它的配置优先级是高于原`_config.yml`的。大部分Fluid支持的功能都可以参考[主题配置指南](https://hexo.fluid-dev.com/docs/guide/)。

这里只对一些比较常用以及修改比较多的内容进行说明：

## 代码高亮

通过配置项中的`lib`来选择生成给的高亮库，可选的有 `highlightjs` 和 `prismjs`,我个人选择 `highlightjs`，并将 `style` 修改为`an-old-hope` 风格, 在 `_config.fluid.yml` 配置文件中找到并修改内容：

```yml
lib: "highlightjs"

highlightjs:
  # 在链接中挑选 style 填入
  # Select a style in the link
  # See: https://highlightjs.org/demo/
  style: "an-old-hope"
  style_dark: "dark"
  bg_color: true
```

在使用时候发现一款Mac风格代码块样式的方法，需要自定义样式来实现，即在`themes/fluid/source/css`目录下创建一个`mac.styl`的文件，并添加内容：

```css
.highlight
    background: #1C1D21
    border-radius: 5px
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, .4)
    padding-top: 30px

    &::before
      background: #fc625d
      border-radius: 50%
      box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b
      content: ' '
      height: 12px
      left: 12px
      margin-top: -20px
      position: absolute
      width: 12px
```

然后需要在 `_config.fluid.yml` 文件中找到自定义 `custom_css` 选项，将 `/css/mac.css`添加:

```yml
custom_css:
  - /css/mac.css
```


> 说明，这个虽然是在 `themes/fluid/source/css` 目录下，但是生成的静态文件，会将 `source` 下的内容都映射到根目录，所以配置时候用的目录为 `/css/`，对于以 `.css` 结尾也是同样道理。



对于**行内代码块**的颜色, 默认的行内代码颜色和正文颜色是继承关系，且行内代码背景色不明显，因此视觉上难以区分。所以需要找到 `themes/fluid/source/css/_pages/_base/base.styl`文件中的 `code` 配置选项，改颜色为`#e96900`


## 评论插件

由于 `fluid` 主题默认已经继承了 `Valine` 评论插件，因此只需要配置即可: 进入[LeanCloud](https://leancloud.app/)官网完成注册，在控制台创建一个结构化数据 `Blog.Comments` 的 `Class`, 得到密钥（`App ID` 和 `App Key`），在 `_config.fluid.yml` 中配置即可。

```yml
leancloud:
  app_id: xxx # App ID 填写地方
  app_key: xxx # App Key填写地方
  # REST API 服务器地址，国际版不填
  # Only the Chinese mainland users need to set
  server_url:  xxxx
  # 统计页面时获取路径的属性
  # Get the attribute of the page path during statistics
  path: window.location.pathname
  # 开启后不统计本地路径( localhost 与 127.0.0.1 )
  # If true, ignore localhost & 127.0.0.1
  ignore_local: false
```

当然，需要注意：

1. 这个 `App ID` 和 `App Key` 可以使用我的，那么所有的评论数据和统计数据都会写入我的数据库中。
2. 国际版相比于国内版，不需要实名认证；除此之外，国际版[LeanCloud](https://leancloud.app/)需要邮箱认证，如果没收到邮件，查看是否被当成了垃圾邮箱拦截了。
3.  `us.avoscloud.com`这个域名被弃用了，所以需要修改对应的域名地址，进入[LeanCloud](https://console.leancloud.app/apps)，然后进入应用，`设置 -> 应用凭证`，复制**REST API 服务器地址**，找到博客主题中的关于`valine`部分，修改其中的关于`us.avoscloud.com`的域名。
   
   ![us.leancloud.cn地址无法解析](/img/assets/hexo个性化扩展/leancloud.png)

4.  除此之外，国际版对中国 `ip` 有屏蔽，所以如果评论地址是国内`ip`，那么是访问不到的（解决方案就是使用国内的`LeanCloud`，不过算了，不折腾了）



## Latex 数学公式

这个在 `fluid` 主题中也有了，直接配置即可：

```yml
# 数学公式，开启之前需要更换 Markdown 渲染器，否则复杂公式会有兼容问题，具体请见：https://hexo.fluid-dev.com/docs/guide/##latex-数学公式
# Mathematical formula. If enable, you need to change the Markdown renderer, see: https://hexo.fluid-dev.com/docs/en/guide/#math
math:
  # 开启后文章默认可用，自定义页面如需使用，需在 Front-matter 中指定 `math: true`
  # If you want to use math on the custom page, you need to set `math: true` in Front-matter
  enable: true

  # 开启后，只有在文章 Front-matter 里指定 `math: true` 才会在文章页启动公式转换，以便在页面不包含公式时提高加载速度
  # If true, only set `math: true` in Front-matter will enable math, to load faster when the page does not contain math
  specific: false

  # Options: mathjax | katex
  engine: mathjax
```


# 关于页的编写
这个是通过 `page` 布局来实现的，所以需要自己创建一个：

```
hexo new page about
```

然后在 `about/index.md`文件中的 `Front-matter` 里面添加 `layout` 属性布局：

```yml
layout: about
```

之后一些内容可以在 `_config.fluid.yml` 配置文件中进行相关配置（剩下的就是`about/index.md` 文件的编写）：

```yaml
#---------------------------
# 关于页
# About Page
#---------------------------
about:
  enable: true
  banner_img: /img/default.png
  banner_img_height: 60
  banner_mask_alpha: 0.3
  avatar: /img/avatar.png
  name: "Fluid"
  intro: "An elegant theme for Hexo"
  # 更多图标可从 https://hexo.fluid-dev.com/docs/icon/ 查找，`class` 代表图标的 css class，添加 `qrcode` 后，图标不再是链接而是悬浮二维码
  # More icons can be found from https://hexo.fluid-dev.com/docs/en/icon/  `class` is the css class of the icon. If adding `qrcode`, the icon is no longer a link, but a hovering QR code

  icons:
    - { class: "iconfont icon-github-fill", link: "https://github.com", tip: "GitHub" }
    - { class: "iconfont icon-douban-fill", link: "https://douban.com", tip: "豆瓣" }
    - { class: "iconfont icon-wechat-fill", qrcode: "/img/favicon.png" }
```




# 插入图片的问题
{% note success %}

在介绍插入图片之前，需要了解下 `Hexo` 的大致实现原理，以`post`布局为例（当然，如果使用图床这种方式插入图片，那么这个可以略过）

{% endnote %}

`hexo` 的原理就是将 `/source/_posts`目录下的`*.md` 文件通过渲染，配合各种 `css`, `js` 生成一堆的静态资源（可通过`hexo g` 在 `/public/` 目录下查看）。在搜索 `/source/_posts` 目录的时候只会考虑 `*.md` 文件，并且在生成过程中，这些图片的相对路径起始点是相对于 `/source/` 目录而言的。也就是说，如果图片放在 `/source/_posts` 目录下不会生成图片静态资源（在 `/public/` 目录下无法找到图片）, 因此需要将图片放到 `/source/` 目录且不属于文章扫描目录下。


举例说明下，一些文件目录结构如下：

```bash
├─source
│  ├─img
│  │  ├─index.png
│  │  └─post.png
│  └─_posts
│      ├─文章1.md # 文章1
│      ├─fold1
│      │  ├─文章2.md # 文章2
│      │  ├─post_fold_img # _posts目录下fold1路径的图片路径，不可见
│      │  │   ├─post_fold_index.png
│      │  │   └─post_fold.png
│      └─post_img # _posts目录下图片路径, 不可见
│         └─post_index.png
```
认知如下:

1. 对于 `/source/_posts/` 目录下的图片如 `/source/_posts/post_img/post_index.png` , `/source/_posts/fold1/post_fold_img/*.png` 使用 `hexo g` 生成后的静态资源中，这些图片是不存在的
2. 对于 `/source/img/index.png` 和 `/source/img/post.png` 使用 `hexo g` 生成后的静态资源中图片会被保存在 `/img/index.png` 和 `/img/index.png` 中。

因此，如果使用相对路径来插入图片，那么就需要考虑生成前和生成后图片的路径问题。

当然，我这里使用的是 `vscode` 来进行编写的，插入图片可以将图片插入到 `/source/img/` 目录下，然后通过 `vscode` 中图片路径映射来实现（我使用规则为 `/source/img/blog/:title/image_name.png` 的命名规范方式），具体而言：在 `vscode` 设置中找到 `markdown.copyFiles.destination` 配置，修改为：

```json
"markdown.copyFiles.destination": {
	"**/*": "${documentWorkspaceFolder}/source/img/assets/${documentBaseName}/"
}
```

> 其实最好的方式就是使用**图床**，这样，当插入图片多起来了的时候，就不会导致整个项目臃肿而卡顿。这个等有时间再说吧。


# 原内容同步到GitHub上

使用 `hexo` 自带的 `hexo d` 命令同步数据是将生成的**静态资源**进行同步，对于原手稿（`*.md`，自己博客配置）等内容则还是保存在本地，所以需要使用git来对原内容进行管理。除此之外如果新建一个分支来保存原内容，则有点冗余，这里借用 `git` 分支操作来区分管理。

首先创建一个用于保存源文件的分支 `source`，然后更改该分支为默认分支（之后所有的源文件则是依靠 `git` 与该分支进行同步）。在文件中添加 `.gitignore` 文件，并忽略掉一些无关的配置文件内容：

```bash
.DS_Store
Thumbs.db
db.json
*.log
node_modules/
public/
.deploy*/
```


# 域名配置

可以通过 GitHub Pages 域名进行访问，但也可以自己在 [阿里云](https://dc.console.aliyun.com/#/overview)购买一个域名，然后进行配置，使其能够被解析到博客域名中，具体流程如下：

1. 在 [阿里云](https://dc.console.aliyun.com/#/overview) 注册一个账号，并实名认证后购买一个域名
2. 打开域名控制台，进入 **域名解析** ,添加两类记录：
    - 主机记录：@，记录类型：A， 记录值为 `GitHub Pages` 域名的 `IP` 地址
    - 主机记录：www , 记录类型：CNAME ， 记录值为 `GitHub Pages` 域名

  ![域名配置](/img/assets/hexo个性化扩展/image.png)

3. 在路径 `/source` 目录下新建一个 `CNAME` 文件，里面填写域名即可
4. `GitHub` 中打开对应的仓库，在 `Setting` 中找到 `Pages` ，添加 `Custom Domain` 为新买的域名，旁边一个 `Enforce HTTPS` 勾选，然后网站就是 `https` 协议了。



# 网站优化

## 搜索路径优化

`Hexo` 博客默认的文章路径是 `域名/年/月/日/文章标题`，这样的多层目录搜索引擎爬虫爬起来非常费力，b并且平时查阅起来也很困难，因此需要优化文章的 `URL` 路径：打开`_config.yml`，找到 `permalink` 项，将 `:year/:month/:day/:title/` 修改为 `:name.html`，就可以用 `域名/文章标题` 访问了。

> `:title` 和 `:name` 的区别是：前者访问时会保留相对于 `_post` 目录的路径，改成后者后就是纯粹的文章标题。
> 
此外，还可以将其中的 `pretty_url` 项中的两个 `true` 改为 `false` 用于处理 `URL` 的文章标题：两项分别是去除连接中的后缀 `index.html` 和 `.html` 的。

## 添加Bing/谷歌收录

如果想让其他搜索引擎抓取到自己网站的内容，可以等其搜索引擎自动抓取链接，并插入到其数据库中索引。但是这种方式比较缓慢（可能都爬不到自己搭建的网站），所以需要我们自己人为配置去告诉搜索引擎我们的网站地址是什么。

>  `Github Pages` 禁止了百度爬虫，所以**百度引擎搜索**是无法爬取到文章内容的，并且如果要配置的话，需要实名认证，略显麻烦。所以这里只考虑 Bing和谷歌搜索引擎的配置。

如果想要判断是否已经被搜索引擎给收录了，直接在相关搜索引擎框中搜索即可：

```bash
site:域名
```

配置的话也简单，主要是 **生成站点地图** + **提交站点地图**：

1. 首先是生成**站点地图**：Hexo配置站点地图可以利用 `hexo-generator-sitemap` 插件:
    ```bash
    npm install hexo-generator-sitemap --save

    # 如果是百度的话，需要使用
    npm install hexo-generator-baidu-sitemap --save
    ```

    那么每次打包生成public目录下就会生成 `sitemap.xml`，百度的话会生成 `baidusitemap.xml`。部署之后可以通过 `域名/sitemap.xml` 进行查看。


2. 然后就是**提交生成的站点地图**:分别针对[Google搜索提交入口](https://search.google.com/search-console/welcome?hl=zh-CN&utm_source=wmx&utm_medium=deprecation-pane&utm_content=home) 和 [Bing搜索提交入口](https://www.bing.com/webmasters?tid=9a0213e1-6760-4a69-9d63-db2cec5c229f)，填写域名相关信息，使用`HTML`标签方式进行验证，打开`themes/fluid/layout/_partial/head.ejs` 文件，将验证标签放入 `<head></head>`中添加：
  ```html
  <head>
    <!-- google相关的验证信息 -->
    <meta name="google-site-verification" content ="******">

    <!-- Bing相关的验证信息 -->
    <meta name="msvalidate.01" content="****" />

  <head>
  ```
3. 重新 `hexo d` 后，等待数分钟，点击完成验证，就会出现成功提示。
4. 需要将生成的站点信息提交到相关的搜索引擎：打开[google站点信息提交](https://search.google.com/search-console/sitemaps)或者[Bing站点信息提交](https://www.bing.com/webmasters/sitemaps)，找到站点地图，将之前生成的 `域名/sitemap.xml` 添加即可。

