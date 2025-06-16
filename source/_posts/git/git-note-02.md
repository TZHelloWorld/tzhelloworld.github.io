---
title: 本地仓库的使用
excerpt: '这个是git的基础，主要包含Git中对本地仓库的使用场景'
index_img: /img/post/git.png
category_bar: ["Git"]
categories:
  - 技术栈
  - Git
tags:
  - Git
date: 2025-06-05 23:42:35
updated:
sticky:
---
# 本地Git

在本地可以通过命令新建一个空的代码库：

```bash
# 在当前目录新建一个Git代码库
git init [project_name]
```

然后就可以开始对一个本地 `Git` 仓库进行管理。

## 配置

Git 自带一个 `git config` 的命令来设置并控制 `Git` 外观和行为的配置变量。 这些变量存储在三个不同的位置：

1. `GIT/etc/gitconfig` 文件: 包含系统上每一个用户及他们仓库的通用配置。 如果在执行 `git config` 时带上 `--system` 选项，那么它就会读写该文件中的配置变量。 （由于它是系统配置文件，因此你需要管理员或超级用户权限来修改它。）这个是在 `GIT`表示在安装目录。
2. `~/.gitconfig` 或 `~/.config/git/config` 文件：只针对当前用户。 你可以传递 `--global` 选项让 `Git` 读写此文件，这会对你系统上 **所有** 的仓库生效。
3. 当前使用仓库的 `Git` 目录中的 `config` 文件（即 `.git/config`）：针对该仓库。 你可以传递 `--local` 选项让 `Git` 强制读写此文件 （默认情况下用的就是它。当然，你需要进入某个 `Git` 仓库中才能让该选项生效。）

> 当然也可以直接编辑上述配置文件，但是不推荐。

一般都是个人电脑上使用，所以绝大多数时候采用的是针对当前用户(`--global`)的方式进行配置：

```bash
git config --global user.name "[name]"
git config --global user.email "[email address]"
```

除此之外，个人感觉使用比较多的命令有：

```bash
# 显示当前的Git配置
git config --list

# 编辑Git配置文件
git config -e [--global]

# 查看所有的配置以及它们所在的文件
git config --list --show-origin
```

对于配置内容而言，除了用户名（`name`）、邮件（`email`）外，还有其他需要配置的（超时时间设置，大文件下载设置。参考：[关于 GitHub 上的大文件 - GitHub 文档](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github#file-size-limits)）：

- `http.lowSpeedLimit` ：设置 `HTTP` 传输的最低速度限制（字节/秒），0 表示不限制最低速度，即 `Git` 不会因为速度过慢而中断连接。默认行为：如果未设置，`Git` 可能会在低速连接时终止 `HTTP` 传输。
- `http.lowSpeedTime`：设置 `Git` 允许低速传输的最长时间（秒）。只有当 `http.lowSpeedLimit` 非零时，这个参数才会生效。默认行为：`Git` 默认可能会在 30 秒（或更短）内终止低速连接。
- `http.postBuffer`：设置 `Git` 通过 `HTTP` 发送的最大数据缓冲区大小。默认值为1MB（1048576字节）；设置大值适用于推送大文件或大仓库的情况。

```bash
git config --global --add http.lowSpeedLimit 0
git config --global --add http.lowSpeedTime 999
git config --global --add http.postBuffer 52428800000
```

## 基本流程操作（add、commit）

在初始化一个仓库之后，我们就可以创建文件并添加内容（此时的文件是 `Untracked`状态），创建一个 `helloworld.txt` 文件，并添加内容，之后可以将其追踪并提交:

```bash
git add helloworld.txt      # 如果有多个文件，可以追加到后面，之后该文件变成 Staged 暂存状态
git commit -m "first commit"  # -m 表示message，备注本次提交信息，此时文件变成了 Unmodified 状态

# 上述两个语句可以合并成一个
git commit -am "first commit"
```

上述 `add` 命令后加的是文件名，除此之外，可以是 **目录、通配符** 等等：

```bash
git add .          # 相对路径中 . 表示当前目录，表示当前目录下所有文件
git add *.txt  	   # * 代表任意字符串，所有 .cpp后缀的文件被添加
git add test?.txt  # ? 代表单个字符，不得为空，因此如 test1.txt 将被添加，而 test.txt 则不会
git add dir/  	   # 添加路径下的 dir 文件夹内全部文件， / 有没有皆可
```

对于 `commit` 命令，有一些比较常用的：

```bash
# 提交暂存区到仓库区
git commit -m [message]

# 提交暂存区的指定文件到仓库区
git commit [file1] [file2] ... -m [message]

# 提交工作区自上次commit之后的变化，直接到仓库区
git commit -a

# 提交时显示所有diff信息
git commit -v

# 使用一次新的commit，替代上一次提交
# 如果代码没有任何新变化，则用来改写上一次commit的提交信息
git commit --amend -m [message]

# 重做上一次commit，并包括指定文件的新变化
git commit --amend [file1] [file2] ...
```

## 撤销操作（reset）

对于已经暂存的文件，如果后悔 `add`了，可以取消暂存：

```bash
# 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
git reset [file]

# 重置暂存区与工作区，与上一次commit保持一致
git reset --hard

# 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
git reset --hard [commit]
```

其实需要比较下三种重置区别：

- `git reset --soft`： 保留 **工作区** 和 **暂存区** 的内容
- `git reset --hard`： 对于 **工作区** 和 **暂存区** 的内容都不保留
- `git reset --mixed`：保留 **工作区** 内容，但是不保留 **暂存区** 的内容

## 对比（diff）

为了随时查看此时文件的状态，可以通过一些命令进行对比

```bash
git status         # 查看工作区、暂存区的文件，一般前者是红色，后者是绿色
git diff           # 查看工作区和暂存区的差异，适用于暂存后又修改的内容
git diff --cached  # 查看暂存区与 Git 仓库的差异，适用于提交前查看
git diff HEAD      # 同时查看其他两个区和 Git 仓库的差异
```

![diff详解](/img/assets/git-note-02/image.png)

一般，我们都是使用可视化工具去对比差异，否则太多了。

## 查看信息

提交历史中，每个提交记录都有对应的 `commit hash` 值，唯一标识了这次提交，这是 `Git` 用 `SHA-1 hash` 生成的加密字符串。可以通过命令查看：

```bash
git log

# 除此之外，如果因为版本回退导致有些 commit hash 记录未被显示，可以使用
git relog
```

注：如果 `git log` 比较长或者窗口比较小，这会触发「导航」模式，

不传入任何参数的默认情况下，`git log` 会按时间先后顺序列出所有的提交，其中常用的参数有：

- `-p`：按补丁格式显示每个提交引入的差异。
- `--stat`：显示每次提交的文件修改统计信息。
- `--shortstat`：只显示 `--stat` 中最后的行数修改添加移除统计。
- `--name-only`：仅在提交信息后显示已修改的文件清单。
- `--name-status`：显示新增、修改、删除的文件清单。
- `--abbrev-commit`：仅显示 `SHA-1` 校验和所有 40 个字符中的前几个字符。
- `--relative-date`：使用较短的相对时间而不是完整格式显示日期（比如“2 weeks ago”）。
- `--graph`：在日志旁以 `ASCII` 图形显示分支与合并历史。
- `--pretty`：使用其他格式显示历史提交信息。可用的选项包括 `oneline`、`short`、`full`、`fuller` 和 `format`
- `--oneline`：`--pretty=oneline --abbrev-commit` 合用的简写。|

```shell
# 显示有变更的文件
> git status

# 显示当前分支的版本历史
> git log

# 显示commit历史，以及每次commit发生变更的文件
> git log --stat

# 搜索提交历史，根据关键词
> git log -S [keyword]

# 显示某个commit之后的所有变动，每个commit占据一行
> git log [tag] HEAD --pretty=format:%s

# 显示某个commit之后的所有变动，其"提交说明"必须符合搜索条件
> git log [tag] HEAD --grep feature

# 显示某个文件的版本历史，包括文件改名
> git log --follow [file]
> git whatchanged [file]

# 显示指定文件相关的每一次diff
> git log -p [file]

# 显示过去5次提交
> git log -5 --pretty --oneline

# 显示所有提交过的用户，按提交次数排序
> git shortlog -sn

# 显示指定文件是什么人在什么时间修改过
> git blame [file]


# 查看所有版本
> git reflog
```

# 分支（Branch）

对于分支的操作，推荐一个在线学习网站：[Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)

在初始化时，`Git`为我们自动创建了第一个分支 `master(或者main)`,以及指向 `master`的一个指针 `HEAD`。如下图，如果使用 `git`创建的默认分支，并且提交了三次，到达版本 `V4`，此时，有两个分支指针指向该版本的状态。

![分支指针](/img/assets/git-note-02/main 1.png)

注意 `master`分支与 `HEAD`的区别：

1. `HEAD`是一个指向当前所在分支最新提交（`commit`）的指针。它代表了当前工作目录所在的分支的最新提交版本。当你进行一次新的提交时，`HEAD`会指向这个新提交，并将当前分支的指针更新为新提交。也就是说，**`HEAD`始终指向当前工作目录所在的分支的最新提交**。
2. `master`（或者 `main`）是一个默认创建的分支，通常用于主要的开发和代码稳定版本的管理。它是代码主线的一个表示。当你初始化一个新的 `Git`仓库时，通常会默认创建一个名为 `master`（或者 `main`，根据不同的 `Git`版本和设置而有所不同）的分支。

## 创建分支 & 切换分支

创建分支语句如下：

```bash
git branch [branch-name] # 创建一个 branch-name 的分支
```

注意: 创建完分支后，**会将分支指向当前所在的节点**。对于已有分支，可以通过命令查看并切换:

```bash
git branch # 查看本地分支，带有 * 表示 HEAD 指向的当前分支
git checkout [branch-name] # 检出，切换到 branch-name 的分支


# 当然可以使用 checkout 创建新的分支并且切换到新分支
git checkout -b [branch-name] 

# 可以创建一个新分支指向某个Tag ： 如 v0.4.6

git checkout -b [branch-name] [tag-name]
```

由于 `git checkout` 可以用于切换分支，也可以用于恢复文件（如果名字相同，默认是切换分支），为了避免冲突，在 `git 2.23` 版本之后，推荐使用 `git switch` 命令用于切换分支

## 合并分支（merge & rebase）

对于版本迭代，如下，当主分支(`master/main`)开发到版本 `V2`，发现功能需要继续完善，但是版本 `V3`以及后面的功能能继续交给其他人员开发，这时候就可以在 `V2`后创建 `DEV`分支，然后开始功能完善。（**注意:以下图中真正使用的时候，版本应该是 `Hash`值，而不是类似于 `v1`这种**）

![版本迭代分支开发](/img/assets/git-note-02/aaa.png)

一般在实际开发的时候根据功能将主分支中的每个版本的具体实现通过创建不同的分支交给不同的开发人员进行开发，比如：

![各个分支开发独立功能](/img/assets/git-note-02/branch1.png)

当上述分发的功能代码开发完成后，需要 `review` 和测试，最后保证正确的情况下，需要通过合并分支的操作将开发代码进行合并操作。如：
![合并分支代码](/img/assets/git-note-02/branch2.png)

### git merge

使用语法：

```bash
git merge <合并的分支>
```

`git merge`命令还支持一些选项，用于控制合并的行为。其中一些常用的选项包括：

- `--no-ff`：禁用 `fast-forward`合并策略，强制 `Git`创建一个新的合并提交。
- `--squash`：将合并结果压缩为一个提交，并且不会保留源分支的提交历史。
- `-m <message>`：指定新的合并提交的提交信息。

在当前 `HEAD` 分支执行语句 `git merge DEV` 表示当前分支合并 `DEV`分支。如果不产生冲突，那么直接合并成为一个新的版本即可，如图：

![git merge](/img/assets/git-note-02/merge.png)

注意：当使用 `git merge` 时候，当前分支与合并的分支如果有冲突，就会提示自动合并失败，需要自己去处理冲突（如果两个分支对同一个文件的同一个地方进行修改，产生了冲突 `conflict`，需要手动解决冲突自己手动选择哪个分支的修改），然后进行提交：

1. 使用 `git diff` 或者 `git status`查看哪些文件冲突
2. 解决冲突文件
3. 进行 `git add` 和 `git commit` 进行提交。

> 一般这种冲突也是借助开发工具去diff然后选择哪个修改。

### git rebase

`rebase` 合并往往又被称为 **「变基」**，就是**改变当前分支的起点。注意，是当前分支！** `rebase` 命令后面紧接着的就是 **「基分支」**。**「变基」**操作是会改变提交历史的，但是这种方式不会增加额外的提交记录，会形成线性的提交历史，比较干净和直观。使用语法：

```bash
git rebase <基分支>
```

首先会找到 **当前分支** 和 **基分支** 的共同祖先节点，然后将当前分支上从共同祖先到最新提交记录的所有提交都移动到目标分支的最新提交后面。如下图，使用命令：

```bash
git switch DEV # 切换到DEV分支
git rebase master # 将当前DEV分支 rebase 到 master 分支

# 其实可以简化上述两种命令：
git rebase master DEV
```

![rebase](/img/assets/git-note-02/rebase.png)

如图，由于当前分支是 `DEV`，所以 `HEAD`分支指向 `DEV`,而 **「基分支」** 则是 `master`,因此执行逻辑为：

- 找到 `master` 分支和 `DEV` 分支的共同祖先节点 `V2`
- 找到 **当前分支 `DEV`** 到共同祖先节点 `V2` 的所有提交记录节点： `V2.1` 、`V2.2`
- 将 `V2.1` 、`V2.2`提交记录文件修改的内容提交到 `master` 分支之后。

> 其实，这里也需要考虑rebase之后的文件冲突问题。

## 删除分支

```bash
# 删除分支
git branch -d [branch-name]

# 删除远程分支
git push origin --delete [branch-name] # 在推送完成后，删除
git branch -dr [remote/branch] # 直接删除
```

## 分叉（Branch Diverged）

分叉主要是当某个 `DEV` 分支开发到一半，因为特殊情况，需要废弃掉整个 `DEV` 分支，那么整个 `DEV` 分支的提交记录就是 **分叉**。产生分叉的原因有很多。

# git stash

当我们在一个分支上开发时候，需要切换到其他分支去测试，但是又不想提交当前的内容到本地仓库中，那么就可以使用 `git stash`。 `stash`，直译为**储藏**，默认会将未提交的修改（Git追踪暂存和非暂存的）都保存起来。那么这时候就可以切换其他分支去操作了。

使用语法如下：

1. 记录一个stash版本:

```bash
  git stash

  # 保存的时候添加一个message方便记录版本
  git stash save "message"
```

2. 重新使用：

```bash
  git stash pop　# 弹出stash，会将最上面的stash删除

  git stash apply  # 只是使用stash，不会将存储的进项删除
```

3. 查看现有的 `stash`:

```bash
  git stash list
```

4. 移除 `stash`:

```bash
  git stash drop stash@{0}
```

需要注意的是：

- `stash`是本地的，不会通过 `git push`命令上传到远程服务器上
- 默认情况下，`git stash`只会缓存 `Git`暂存(`staged`)和 `Git`追踪未暂存(`unstaged`)的内容。对于 `untracked` 内容和 `ignored` 内容则是不会缓存


{% note warning %}
当在  `a` 分支使用git stash 保存工作空间内容，然后切换到 `b` 分支，此时  `git stash pop` 状态会尝试将存储中的内容添加到 `b` 分支之上，如果有冲突则提示需要手动 `merge` 。
{% endnote %}
