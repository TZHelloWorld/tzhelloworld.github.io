---
title: "git工作流之 MR 和 PR"
excerpt: '这个是使用Git过程中比较常用的 Merge Request 和 Pull Request 工作流'
index_img: /img/post/git.png
category_bar: ["Git"]
categories:
  - 技术栈
  - Git
tags:
  - Git
date: 2025-06-08 16:26:50
updated:
sticky:
---
{% note success %}

这里对在工作中使用的最多`MR` (`Merge Request`)和在开源社区使用最多的`PR` (`Pull Request`) 内容介绍以及工作流进行阐述。开始之前，借用`Gitlab`的官方解释:

_Merge or pull requests are created in a git management application and ask an assigned person to merge two branches. Tools such as GitHub and Bitbucket choose the name pull request since the first manual action would be to pull the feature branch. Tools such as GitLab and Gitorious choose the name merge request since that is the final action that is requested of the assignee. In this article we'll refer to them as merge requests._

翻译过来简单理解就是：这两个没有本质区别，站在不同立场说法不一样而已。【个人更倾向于使用`MR`进行表述，而`PR`感觉是在`github`设计之初，命名随意，导致后续版本迭代和需求复用了之前的名字，最后就约定俗成了】

看网上介绍，大体叫法是：
- `Github`仓库, 合代码操作一般叫做`Pull Request`, 对应的是`fork`工作流。
- `Gitlab`仓库, 合代码操作一般叫做`Merge Request`, 对应的是 `Merge` 工作流。

{% endnote %}



# 为什么会有 MR 和 PR ？
> 总结起来就是：`MR`是为了能在合代码之前做一次 `Code Review`。

`MR` (或者`PR`) 就是指将你开发的代码内容以一种**请求合并**的方式合到它想去的分支上，不过在此之前，需要对代码进行 `Code Review`(代码复审/审查/检视)，这个请求的接收人 (`Reviewer`) 一般是项目、团队的负责人或者其他成员。`Code Review` 能够提升代码的质量以及减少 `Bug` 的产生概率。

`Merge Request`作为 `Code review` 中的重要一环。在代码审查时，会以本次请求的合并内容为单元进行代码审查；如果审查通过，那么就成功合并。如果出现争议，就可以在相关`MR`链接上进行评论，方便多人协作讨论。

# Merge工作流

## 创建远程仓库，默认使用master分支

在 `gitlab` 仓库中创建一个远程仓库，并且使用默认分支 `master`:

![创建远程仓库](/img/assets/git-note-04/image.png)

## 创建本地仓库，并关联远程仓库

可以直接在本地初始化一个空的仓库，并添加远程仓库地址。之后通过`git pull`的方式拉取最新代码，并将 `master` 分支关联到远程仓库上：

```bash
git init
git remote add origin https://github.com/xxxx/xxx.git
git pull # 拉取内容
git push -u origin master
```
> `git push -u` 的作用就是将远程仓库 `origin` 的 `master` 分支与本地分支进行关联，并推送当前内容到远程分支上。

当然也可以直接通过 `git clone` 方式获取仓库内容，再关联远程分支和本地分支:

```bash
git clone https://github.com/xxxx/xxx.git

git branch --set-upstream-to <本地分支> <远程主机名>/<远程分支名>
```
> 注意，在使用 `git clone` 时，`Git` 默认会创建一个与远程仓库中默认分支（如 `main` 或 `master`）关联的本地分支，并设置该分支跟踪远程的同名分支


## 构建dev和feature分支

{% note warning %}
在项目开发中，为了保持主分支（`main/master`）的稳定性，团队通常会遵循以下分支管理策略：

- **主分支（`main/master`）**：仅用于发布生产环境代码，禁止直接提交。所有变更必须通过其他分支合并（如测试通过的`dev`或`release`分支）。

- **开发分支（`dev`）**：作为集成分支，合并所有已完成的功能模块。日常开发基于此分支创建子分支。

- **功能分支（`feature/xxx`）**：开发者从`dev`分支切出个人分支（如`feature/user-auth`），专注特定模块开发。完成后通过`Pull Request/Merge Request`合并回`dev`分支。（后续忽略`user-auth`进行表述）
{% endnote %}

可以在远程仓库上创建 `dev` 分支，然后通过 `git pull` 的方式拉取到本地，此时本地分支命名为 `origin/dev`, 一般需要创建本地分支`dev`并关联远程分支`origin/dev`:

```bash
git pull

# 创建新分支，默认会关联远程分支（前提是该分支在本地是没有的）
git checkout -b dev origin/dev
```

也可以在本地仓库创建`dev`分支，然后在推送时候指定给他一个远程仓库分支：

```bash
# 查看所有分支确保本地没有dev分支
git branch -a

# 创建一个新分支 dev
git checkout -b dev

# 推送dev分支到远程仓库，并关联为 远程origin仓库的dev分支
git push -u origin dev
```

通过提交一些记录，来模拟开发过程，这里的提交记录有：

![提交记录](/img/assets/git-note-04/image-1.png)


## 开始MR

**功能分支（`feature`）**开发完成后，通常需要合并到 `dev` 分支。虽然可以直接使用 `git merge` 或 `git rebase` 在本地完成合并，但这样会跳过 `Code Review`，不利于团队协作和代码质量管控。比如，对于分支使用 `git Merge` 本地合并的：
![本地merge逻辑，不推荐](/img/assets/git-note-04/mr.jpg)

此时的**正确做法**应该是：仅提交 `feature` 分支的代码变更，无需在本地手动合并到 `dev`。而是通过远程仓库（如 `GitLab/GitHub`）的 `Merge Request（MR）`或 `Pull Request（PR）`功能 来**发起合并请求**。如新建一个`MR`:

![New merge request](/img/assets/git-note-04/image-2.png)

上述操作从源分支合并到目标分支中，相当于本地想做 `git merge <source branch> <target branch>` 操作，需要填写相关内容：

![MR information](/img/assets/git-note-04/image-3.png)

此时，可以继续`feature`分支代码的提交和变更，而 `feature` 分支最新代码的内容变更也会在 `MR` 中体现。

![feature更新内容在MR中体现](/img/assets/git-note-04/image-4.png)

然后就可以由审核人员查看信息。

{% note warning %}
如果 `Merge Request（MR）` 包含的代码量过大，会导致 `Review` 成本过高，团队成员可能不愿意或无法高效完成审查，从而很影响效率。解决思路有：
- 控制 `MR` 的代码规模
- 避免一次性提交大量代码，而是分批次合并可独立运行的模块。
- 使用 `git rebase -i` 整理提交历史

总之，**核心原则就是让每个MR小而专注，让`Review`高效可持续**。
{% endnote %}

# fork工作流








