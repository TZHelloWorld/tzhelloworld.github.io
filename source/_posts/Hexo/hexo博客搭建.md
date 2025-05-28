---
title: hexo博客搭建
excerpt: '谨以此文记录该网站的诞生，用于记录博客的搭建历程以及一些Hexo的使用指南'
index_img: /img/post/hexo.jpg
category_bar: ["博客"]
categories: 
  - 技术栈
  - 博客
tags:
  - Hexo
  - Git
date: 2025-05-13 14:27:11
updated:
sticky:
---
{% note success %}
谨以此文纪念该网站的诞生。
博客的搭建是基于 Hexo + GitHub Page，并采用了Fluid主题。

而写博客的难点，则在于如何把**网状的思考，用树状结构，体现在线性展开的语句中**。这也正是搭建该站点的初衷。

{% endnote %}


# 搭建经历

## 1. 安装Node.js

参考官网：[Node.js — Run JavaScript Everywhere](https://nodejs.org/en/)

安装完成后，在 `cmd` 或者 `bash` 中输入 `node -v` 查看版本。

一个需要注意的点: 在 `Windows` 系统中，默认情况下 `npm` 的全局依赖包和缓存文件会安装在 `C盘` 的默认路径下（可通过 `npm root -g` 查看）。若需将这些目录迁移至其他磁盘（例如 D 盘），需执行以下操作：

```bash
npm config set prefix="D:\\download\\nodejs\\node_global"
npm config set cache="D:\\download\\nodejs\\node_cache"
```

通过命令`npm config ls`查看相关配置（这个配置在`C:\User\用户\.npmrc`文件中），除此之外，为了能够在`cmd`中使用`npm`安装的包的相关命令，需要将上述`prefix`目录添加到 `PATH` 环境变量中。





## 2. 注册GitHub，并创建GitHub Page仓库

注册完`github`后，创建一个仓库（其中的 `{github_username}` 是注册用户的名称）:

```bash
https://github.com/{github_username}/{github_username}.github.io
```

此时可以在浏览器中访问域名：`https://{github_username}.github.io`

> 注意：如果创建的仓库取了其他名字，那么访问的域名则是：`https://用户名.github.io/仓库名/`


## 3. 下载Git

安装Git，参考官网：[Git](https://git-scm.com/)

配置全局（`--global`）的个人信息:

```bash
git config --global user.name "xxx"
git config --global user.email "xxxxx@google.com"
```

可以通过 `git config --global --list` 查看全局的 `git` 配置。

## 4. 配置GitHub SSH

如果需要将本地代码同步到 `GitHub` 上，需要使用`Git`与远程仓库建立安全连接，那么后续 `push/pull` 仓库时就不需要重复输入密码了。在2021年8月13号之后，HTTPS的建立安全连接方式被github停止使用了,并且官方推荐使用SSH协议的方式登录GitHub。


本地生成一个**私钥-公钥对**：
```bash
ssh-keygen -t rsa -b 4096  -C "xxx@qq.com"
```
参数详解：
- `-t` : 指定加密算法类型，这里指定使用 `RSA` 算法生成密钥
- `-b` : 指定密钥的位数
- `-C` : 添加注释(`--comment`)


完成后，会在一个提示目录下找到公钥文件（默认是`~\.ssh\id_rsa.pub`）,在 `GitHub` 的设置中找到SSH，并将生成的公钥内容添加相关的Key中。配置完成后在本地通过命令检测是否配置成功：

```bash
ssh -T git@github.com
# 运行结果出现类似如下即表示成功
# Hi {github_username}! You've successfully authenticated, but GitHub does not provide shell access.
```

## 5. 安装Hexo
参考官网：[Hexo](https://hexo.io/zh-cn/)

在电脑中新建 `Blog` 文件夹，如 `D:\Blog`。在 `cmd` 命令行打开D盘，用 `cd Blog`命令进入 `Blog子目录`。

根据 [Hexo 官网](https://hexo.io/zh-cn/) 上提示的全局安装命令：
```bash
npm install hexo-cli -g
```

输入初始化部署命令：
```bash
# 或者进入一个空文件目录，然后使用hexo init
hexo init blog_test
```
即可在 `Blog目录下` 新建博客文件夹 `blog_test`，然后 `cd blog_test` 进入博客子目录，然后安装 `Node.js` 包管理器命令，安装所有依赖：

```bash
npm install
```

输入生成本地预览命令：
```bash
hexo s

# 或者
hexo server
```
默认会生成 `localhost:4000` 端口的网址，在浏览器中可以访问。

![localhost:4000](/img/assets/hexo博客搭建/Pasted_image_20250507232450.png)


## 6. 安装编辑器

主要是用于编写文档和修改配置，可以选择使用 `VsCode` （其他的也可以）。直接按照 `MarkDown`的语法规则编写内容即可（当然也可以直接用 `HTML` 语法规则编写内容）。

内容编写完成后，可依此执行用于 清理缓存、生成博客文件、生成本地预览 的命令：

```bash
hexo cl # 或者 hexo clean

hexo g # 或者 hexo generate

hexo s # 或者 hexo server
```

在启动完服务后，即可在浏览器中查看相关生成内容的预览。


## 7. 将 Hexo 发布到 GitHub 仓库

参考 [Hexo git 一键部署](https://hexo.io/zh-cn/docs/one-command-deployment#Git)内容：打开整个项目根目录中的 `_config.yml`，更改有关参数：
- `#Site`: 站点的描述内容（自行修改）
- `#URL`:部分，这个是站点链接，如果绑定了域名改为相关域名即可，否则直接用`GitHub Page`的域名
- `#Deployment`
  - `type`: 改为 `git`
  - `repo`: 改为 `GitHub`仓库地址
  - `branch`: 改为`main`


安装部署插件：
```bash
npm install hexo-deployer-git --save
```

之后执行命令即可将 `Hexo` 内容发布到 `GitHub` 仓库中:

```bash
hexo d # 或者 hexo deploy
```

> 同步主要是 `#Deployment` 内容的修改,执行同步命令后，将 `hexo g` 生成的静态文件（默认是`public`目录下）同步推送到`repo`指定的`GitHub`仓库地址，并且指定分支为`branch`的内容。而使用`GitHub Page`的话，默认使用`main`分支。


# Hexo的基础使用

## 1. 新建文章：

使用命令（因为默认布局是文章`post`）：
```bash
hexo new "文章名" # 也可以hexo n "文章名"
```

文章名可以自由更改，新建后会在`/source/_posts` 创建一个 `文章名.md` 的文件，文章名不需要文件后缀，会自动生成 `Markdown` 文件，且带有预先定义的参数（在 `Front-matter` 中），如标题、日期、标签等。

> 这个 `Front-matter` 可参考[Front-matter | Hexo](https://hexo.io/zh-cn/docs/front-matter) , 就是配置一些渲染设置，文章分类标签，创建时间等等内容。



## 2. 布局管理
```bash
hexo new [layout] "文章名" # 也可以hexo n [layout] "文章名"
```

其中，`layout` 可替换为 `post`（文章，默认）、`draft`（草稿）、`page`（页面）。对于这三种布局，有默认的三种`Front-matter`模板（在 `scafflolds` 路径下）,可以提前修改相关的 `Front-matter` 模板。

对于三种布局，个人感觉最大的区别在于：
- 文章 `post`，在`_posts`目录下创建一个 `title.md` 文件。
- 页面 `page`，在`source`目录下创建一个 `title` 的文件夹，然后在里面创建一个`index.md`，
- 草稿 `draft`，在`source`目录下的`_drafts`目录，创建一个 `title.md` 文件

## 3. 分类和标签

在Hexo中，分类和标签有着明显的区别：**分类具有顺序性和层次性，而标签没有顺序和层次**。

一般分类和标签主要是写在`Front-matter`内容中，如本文章的设置：

```bash
categories: 
  - 技术栈
  - 博客 
tags:
  - Hexo
  - Git
```






