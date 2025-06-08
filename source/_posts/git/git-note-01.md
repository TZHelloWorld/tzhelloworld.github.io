---
title: git基础知识
excerpt: '这个是git的基础，因为最近对git需求比较高，所以系统学习了一下'
index_img: /img/post/git.png
category_bar: ["Git"]
categories:
  - 技术栈
  - Git
tags:
  - Git
date: 2025-05-30 00:33:25
updated:
sticky:
---

# git的基础概念

## 模式

对于大多数版本控制软件是基于 **差异** 进行控制的，即在不同版本间记录的是文本的 **变化**，版本切换时候根据 `delta` 进行前进和后退。

而 `Git` 采用快照的方式，对每个版本记录全部文件的快照并建立索引。这样在 **版本/分支** 切换时候的速度就很快（无需 `delta-based` 模式下的线性遍历）。并且快照是以**行**为单位`diff`的，所以对于二进制文件，Git就相对较差。



## 基本状态 & 文件组织

版本控制其实就是对文件的版本进行控制（如修改、提交等等操作）。而由 `git` 进行管理的文件有几种状态：

- `Untracked`：**未跟踪**，此文件在文件夹中，但并没有加入到`git`库，不参与版本控制。可以通过`git add`命令，使状态变为`Staged`。

- `Unmodify`：**文件已经入库**, 但未修改, 即版本库中的文件快照内容与文件夹中完全一致.。这种类型的文件有两种去处, 如果它被修改, 而变为`Modified`. 如果使用`git rm`移出版本库, 则成为`Untracked`文件；    

- `Modified`: **文件已修改**, 仅仅是修改, 并没有进行其他的操作。这个文件也有两个去处, 通过`git add`可进入暂存`staged`状态, 使用`git checkout`则丢弃修改并返回到`unmodify`状态, 这个`git checkout`即从库中取出文件, 覆盖当前修改 !    

- `Staged`: **暂存状态**. 执行`git commit`则将修改同步到库中, 这时库中的文件和本地文件又变为一致, 文件为`Unmodify`状态. 执行`git reset HEAD filename`取消暂存, 文件状态为`Modified`
  
![文件的基本状态转换](</img/assets/git-note-01/Pasted image 20231003233015.png>)


而在磁盘上，版本控制状态则是以文件的形式存在，即通过文件的方式对工作空间与`git`仓库进行组织：

![本地磁盘内容](</img/assets/git-note-01/git-第 2 页.drawio.png>)

其中，
- `Directory`：使用`Git`管理的一个目录，也就是一个仓库，包含我们的**工作空间**和**Git的管理空间**。 
- `WorkSpace`：需要通过`Git`进行版本控制的目录和文件，这些目录和文件组成了工作空间。
- `.git`：存放`Git`管理信息的目录，初始化仓库的时候会自动创建。
- `Index/Stage`：暂存区，或者叫待提交更新区，在提交进入`repo`之前，我们可以把所有的更新放在暂存区。
- `Local Repo`：本地仓库，一个存放在本地的版本库；`HEAD`分支是指向当前的开发分支（branch）。
- `Stash`：隐藏，是一个工作状态保存栈，用于保存/恢复`WorkSpace`中的临时状态。这个主要是不想提交当前分支，但是又想切换到其他分支，那么通过`stash`保存分支未提交的临时状态。


## 工作空间

Git**本地**有三个工作区域：
- 工作目录（`Working Directory`）
- 暂存区(`Stage/Index`)
- 历史资源库(`Repository` 或 `Git Directory`)

再加上远程的`git`仓库(`Remote Directory`)就可以分为四个工作区域。文件在这四个区域之间的工作 `原理/流程` 可以表示为：

![流程转换](/img/assets/git-note-01/111.png)



## 分支相关基本概念

在分支中，存在一些常见的分支，如：
- `main`: 默认主分支
- `origin`: 默认远程仓库
- `HEAD`: 指向当前分支的指针
- `HEAD^`: 指向当前分支的上一个提交版本
- `HEAD~4`: 指向当前分支的上4个提交版本

## 特殊文件
在使用 `Git` 的时候，需要配合一些特殊文件来进行管理，如：
- `.git`：`Git`仓库的元数据和对象数据库
- `.gitignore`：忽略文件，不需要提交到仓库的文件
- `.gitattributes`：指定文件的属性，比如换行符啥的
- `.gitkeep`：使空目录被提交到仓库（默认空目录是不会被提交到仓库的）
- `.gitmodules`：记录子模块的信息
- `.gitconfig`：记录仓库的配置信息

### `.gitconfig` 文件

在项目的中 `.gitconfig` 文件用于记录哪些文件不需要添加到`Git`版本管理中(`.gitignore`文件生效的前提是该文件不能是已经被添加到`Git`版本库中的文件)。其使用的匹配规则是`blob`模式匹配，具体可以参考:[Git - gitignore Documentation](https://git-scm.com/docs/gitignore/zh_HANS-CN)

文件 `.gitignore` 的格式规范如下：
- 所有空行或者以 `#` 开头的行都会被 `Git` 忽略。
- 可以使用标准的 `glob` 模式匹配，它会递归地应用在整个工作区中。
- 若规则以 `/` 结束，则会匹配项目中所有同名目录下的内容，但不匹配同名文件；
- 若规则以 `/` 开始，则会从项目根目录开始匹配；
- 若规则不包含 `/`，会对 `.gitignore` 同路径下的文件和目录进行屏蔽；
- `*` 匹配除了 `/` 以外的任意字符串，`**` 匹配完整路径名；
- `?` 匹配除了 `/` 以外的任意单个字符；
- 要忽略指定模式以外的文件或目录，可以在模式前加上叹号（`!`）取反。
- 不能识别中文，因为默认编码是 GBK。

等等。这里显示一个常见的`.gitignore` 文件:

```.gitignore
# 所有以 .a 结尾的文件
*.a

# 但是追踪所有的 lib.a 即便上面忽略了 .a 文件
!lib.a

# 之忽略当前目录下的TODO 文件，不会忽略如 subdir/TODO 文件
/TODO

# 忽略任何目录下名为build的文件夹
build/

# 忽略 doc/notes.txt, 但是 对于 doc/subdir/notes.txt 不忽略
doc/*.txt

# 忽略 doc/ 目录及其所有子目录下的 .md 文件
doc/**/*.md
```


# 使用 Git
在[Git 官网](https://git-scm.com/doc)中有很多对于Git的介绍，这里只记录常用的内容。

## GUI可视化

对于初学者而言，在了解了`Git`的组织结构以及基本概念后就是需要实际操作。使用可视化工具可以明显看出每次提交的改动，这里推荐使用[GitKraken](https://www.gitkraken.com/download), 个人感觉整个分支操作可视化会比较友好。除此之外，还有很多。但是推荐在入门之后放弃`GUI`并尝试命令行。


## 命令行

直接用`cmd` 或者 `bash` 即可。在使用`Git`时候直接用 `git --help` 查看用法即可:
```bash
usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           [--super-prefix=<path>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   clone     Clone a repository into a new directory
   init      Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
   add       Add file contents to the index
   mv        Move or rename a file, a directory, or a symlink
   restore   Restore working tree files
   rm        Remove files from the working tree and from the index

examine the history and state (see also: git help revisions)
   bisect    Use binary search to find the commit that introduced a bug
   diff      Show changes between commits, commit and working tree, etc
   grep      Print lines matching a pattern
   log       Show commit logs
   show      Show various types of objects
   status    Show the working tree status

grow, mark and tweak your common history
   branch    List, create, or delete branches
   commit    Record changes to the repository
   merge     Join two or more development histories together
   rebase    Reapply commits on top of another base tip
   reset     Reset current HEAD to the specified state
   switch    Switch branches
   tag       Create, list, delete or verify a tag object signed with GPG

collaborate (see also: git help workflows)
   fetch     Download objects and refs from another repository
   pull      Fetch from and integrate with another repository or a local branch
   push      Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.
See 'git help git' for an overview of the system.

```
有啥不会直接查。


# 遇到问题记录

## Ubuntu中设置Git提示英文

在个人电脑`Ubuntu`系统中使用中文导致安装`git`显示也为中文了。但是只想对`git` 命令改为显示英文,可以借助环境变量`LANGUAGE`和 `Ubuntu`系统中的`alias`来实现,过程如下：

尝试在命令前手动指定所有语言变量：如果输出变为英文，说明别名设置正确后即可生效。
```bash
LANG=en_US.UTF-8 LC_MESSAGES=en_US.UTF-8 LANGUAGE=en_US.UTF-8 git status
```
发现，对于语言而言只是`LANGUAGE`变量有用。即:
```bash
LANGUAGE=en_US.UTF-8 git status
```
所以，`Git`显示英语依赖 `LANGUAGE`变量，因此使用命令之前显式设置`LANGUAGE`变量。可以起一个别名，并且写入到配置文件（`~/.bashrc`）中：
```bash
alias git='LANGUAGE=en_US.UTF-8 git'
```

## git下载大文件内容超时

需要配置（超时时间设置，大文件下载设置。参考：[关于 GitHub 上的大文件 - GitHub 文档](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github#file-size-limits)）：
- `http.lowSpeedLimit` ：设置 `HTTP` 传输的最低速度限制（字节/秒），0 表示不限制最低速度，即 `Git` 不会因为速度过慢而中断连接。默认行为：如果未设置，`Git` 可能会在低速连接时终止 `HTTP` 传输。
- `http.lowSpeedTime`：设置 `Git` 允许低速传输的最长时间（秒）。只有当 `http.lowSpeedLimit` 非零时，这个参数才会生效。默认行为：`Git` 默认可能会在 30 秒（或更短）内终止低速连接。
- `http.postBuffer`：设置 `Git` 通过 `HTTP` 发送的最大数据缓冲区大小。默认值为1MB（1048576字节）；设置大值适用于推送大文件或大仓库的情况。

```bash
git config --global --add http.lowSpeedLimit 0
git config --global --add http.lowSpeedTime 999
git config --global --add http.postBuffer 52428800000
```
