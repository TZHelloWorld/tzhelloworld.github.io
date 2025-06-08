---
title: git远程仓库
excerpt: '关于远程仓库的使用介绍'
index_img: /img/post/git.png
category_bar: ["Git"]
categories:
  - 技术栈
  - Git
tags:
  - Git
date: 2025-06-07 23:13:44
updated:
sticky:
---

# 远程的`Git`仓库

虽然 `Git` 本身是一个分布式的，但通常我们需要使用一个远程服务器用于传递和同步不同用户之间的代码状态，因此就有了 `Git` 远程仓库的服务器：
- `GitHub`：以及基于`Git`的代码托管平台，官网：[GitHub](https://github.com/)
- `GitLab`:一般用于内部搭建的。
- `Gitee`: 国内基于`Git`的代码托管平台，官网：[Gitee - 基于 Git 的代码托管和研发协作平台](https://gitee.com/)

> 注意：服务器上的代码内容未必是最新的，并且不同用户之间如果不同步的话，代码状态也未必是一致的

## 鉴权

为了能够在本地使用 `GitHub` 远程仓库(其他远程仓库同理)，需要对本地用户进行鉴权（告诉本地`Git`自己能够访问远程仓库地址），目前常用的鉴权方式有：
- **用户名+密码**：一般是 `GitHub` 关联 `HTTPS`协议时候使用（但是注意：2021年8月13号之后，`HTTPS`的提交方式被`GitHub`停止使用了）
- **`SSH`密钥对**: `GitHub`官方推荐, 在本地生成`SSH`密钥,并且需要在`GitHub`上添加公钥的配置。可参考：[关于 SSH - GitHub 文档](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh/about-ssh)

这里使用`SSH`协议来绑定远程仓库:
1. 本地生成一个**私钥-公钥对**：
  ```bash
  ssh-keygen -t rsa -b 4096  -C "xxx@qq.com"
  ```
  参数详解：
     - `-t` : 指定加密算法类型，这里指定使用 `RSA` 算法生成密钥
     - `-b` : 指定密钥的位数
     - `-C` : 添加注释(`--comment`)

    该操作会生成一个密钥文件，默认是 `~/.ssh/id_rsa`, `~/.ssh/id_rsa.pub`（如果在之前配置了，然后依然指定默认文件，那么就会覆盖之前的`SSH`配置）。当然，本地可以指定使用其他名字的密钥文件，需要在 `~/.ssh/config` 文件中配置一下：
    ```config
    Host github.com
      HostName github.com
      Port 22
      PreferredAuthentications publickey
      IdentityFile ~/.sssh/指定的私钥名称
    ```
2. 配置公钥：在**远程仓库**中配置公钥(默认`~/.ssh/id_rsa.pub`里面的内容)。
3. 验证配置是否成功：
  ```bash
  ssh -vT git@github.com
  # 运行结果出现类似如下即表示成功
  # Hi {github_username}! You've successfully authenticated, but GitHub does not provide shell access.
  ```
  当然可能因为`DNS`污染等原因导致输出内容为：
  ```bash
  debug1: Connecting to github.com [127.0.0.1] port 22.
  ssh: connect to host github.com port 22: Connection refused
  ```
  原因就是将`github.com` 域名解析为了 **本地回环地址(`127.0.0.1`)** ，解决方案可参考：[ssh: connect to host github.com port 22: Connection refused](https://zhuanlan.zhihu.com/p/521340971)


## 克隆远程仓库

远程仓库一般是需要建立连接的，本地开发很少从0开始，所以都是直接 `clone` 远程仓库来建立连接（前提是远程仓库中已有一个仓库）。

```bash
# 使用https协议
git clone https://github.com/xxx/xxxx.git

# 使用ssh协议
git clone git@github.com:xxx/xxxx.git
```
此外，由于远程仓库中代码提交有很长的提交历史以及大的二进制文件内容，所以在 `clone` 远程仓库的时候加上参数`--depth=1`来限制 `clone` 的版本深度：

```bash
# 使用https协议
git clone --depth=1 https://github.com/xxx/xxxx.git

# 使用ssh协议
git clone --depth=1 git@github.com:xxx/xxxx.git
```


## 远程仓库

本地 `Git` 默认链接的远程仓库名为`origin`。可以通过命令列出当前仓库中已配置的远程仓库，并显示它们的 `URL`：

```bas
# 查看远程仓库配置信息
git remote -v

# 内容显示如下
origin  git@github.com:xxx/xxxx.git (fetch)
origin  git@github.com:xxx/xxxx.git (push)
```

除此之外，与远程仓库相关的命令还有：

```bash
# 添加一个新的远程仓库
git remote add <remote_name> <remote_url>

# 将已配置的远程仓库重命名
git remote rename <old_name> <new_name>

# 从当前仓库中删除指定的远程仓库配置
git remote remove <remote_name>
```


## 远程分支

在本地仓库使用 `git log` 查看时会发现历史提交版本中，存在本地分支（如`HEAD`、`master`等）外，还会有类似`origin/`的分支名，这就是远程仓库分支命名规范。可以查看所有的分支有哪些：

```bash
git branch --all  # 参数 --all 代表所有分支，包括远程分支(会以 remotes/ 标识)；可缩写为 -a
```

可以用 `git switch` 切换到任意一个远程分支。（需要注意，切换为具有相同名字本地分支与远程分支的时候，默认会优先本地分支；所以此时，指定远程分支需要添加 `origin/`）

{% note warning %}
远程分支有一个特别的属性，在你切换远程分支时会自动进入一个 **「分离 HEAD 状态」**。在此状态下，不会有 `HEAD -> origin/main -> node`，而是直接有 `HEAD -> node`。因为本地 `Git` 操作不能直接在远程分支上进行操作，需要使用同步操作。
{% endnote %}

在实际操作时候，当在使用 `clone` 命令克隆一个远程仓库到本地的时候，`Git` 一般会自动创建一个 **追踪** `origin/main` 的 `main` 分支。


# 本地分支与远程分支的交互

对于远程仓库和本地仓库，主要是将本地仓库与远程仓库进行同步，保证其他程序员用户能够共享代码并协作。所以，远程仓库的最大作用就是保留备份。但是，**本地的分支是不会自动和远程仓库进行同步的**，需要使用语句去执行，同步命令一般分两种:
* 从远程仓库同步到本地仓库：`git clone`，`git fetch`，`git pull`
* 从本地仓库同步到远程仓库：`git push`


{% note warning %}
在`git push`的时候，一般本地分支与远程分支（上游分支）有个**默认的映射关联**，如果不指定分支，则会使用默认的映射去同步。否则会提示报错`fatal: The current branch xxx has no upstream branch.`，翻译就是**当前的分支没有设置任何上游分支**。
{% endnote %}


## 远程分支与本地分支关联（`upstream`）

在`Git`命令中有很多语句可以设置远程分支与本地分支的关联映射(主要是`upstream`相关)，这里主要介绍自己常用的。


`git`同步远程的思路基本是按照分支来进行的，也就是本地分支和远程分支进行同步的时候(`git push`)只会将当前分支修改的内容同步到远程仓库中，其他分支如果不执行语句则不会主动去同步。关联远程仓库的分支，可以通过：

```bash
# 当前分支 关联 远程分支
git branch --set-upstream-to <本地分支> <远程主机名>/<远程分支名>

# 或者在创建新分支时候关联远程分支 
# 创建本地分支，然后关联远程分支
git checkout -b <本地分支> <远程主机名>/<远程分支名>

# 在推送的本地分支到远程仓库的时候，顺便关联远程分支, 
git push --set-upstream <远程主机名> <本地分支名>:<远程分支名>
# 可以使用省略符 -u ，即：
git push -u <远程主机名> <本地分支名>:<远程分支名>
```

## FETCH & PULL

具体内容介绍，可以通过命令 `git pull --help` 和 `git fetch --help` 查看,对于两个操作的区别在于：
- `fetch`: 下载，只是下载远程分支内容到本地分支
- `pull`: 拉取，拉取远程分支到本地分支，并且尝试将远程仓库中代码和本地分支代码进行合并

常用的命令有：
```bash
# 下载远程仓库的所有变动
git fetch [remote]

# 取回远程仓库的变化，并与本地分支合并
git pull [remote] [branch]
```


## PUSH

> 具体内容介绍，可以通过命令 `git push --help` 查看

使用语法：

```bash
git push [--force] [--set-upstream] <远程主机名> <本地分支名>:<远程分支名>
```
- `--force`: `-f`, 强制推送，即使存在冲突也要覆盖远程分支
- `--set-upstream`: `-u`, 推送的同时，关联相对应的远程分支



如果本地分支名和远程分支名相同，可以省略冒号和远程分支名：
```bash
git push <远程主机名> <本地分支名>
```
如果本地分支已经与远程分支建立了追踪关系，可以省略远程主机名和远程分支名。例如，如果本地分支 `master` 分支已经设置了追踪远程分支 `origin/master`，则可以简单地使用：

```bash
git push
```

如果你想推送当前 `work` 分支到远程同名分支（如 `origin/work`），需要用：
```bash
# 第一次需要建立本地分支与远程分支映射，第二次直接用git push即可
git push -u origin work
```

如果你想将 `work` 分支推送到远程的 `master` 分支，则需要明确指定本地分支：
```bash
# 注意，可能会提示 warning 失败推送，直接 -f 强制推送即可
git push -u origin work:master
```
但不推荐这样做 ，因为直接推送本地分支到远程 `master` 可能覆盖他人工作。





# docker安装gitlab

查找`gitlab`镜像：

```bash
# 查找Gitlab镜像
docker search gitlab

# 拉取Gitlab镜像
docker pull gitlab/gitlab-ce:latest
```


根据镜像启动容器:
```bash
# 启动容器
docker run \
 -itd  \
 -p 9980:80 \ # 将容器内80端口映射至宿主机9980端口，这是访问gitlab的端口
 -p 9922:22 \ #容器上22端口映射到宿主上的9922，访问ssh的
 # 将容器中的/etc/gitlab文件挂载到宿主中的/home/gitlab/etc上
 -v /home/gitlab/etc:/etc/gitlab  \  
 -v /home/gitlab/log:/var/log/gitlab \
 -v /home/gitlab/opt:/var/opt/gitlab \
 --restart always \
 --privileged=true \
 --name gitlab \
 gitlab/gitlab-ce
```

进入容器，修改配置文件：
```bash
#进容器内部
docker exec -it gitlab /bin/bash
 
#修改gitlab.rb
vi /etc/gitlab/gitlab.rb
 
#加入以下内容到文件中：

#gitlab访问地址，可以写域名。如果端口不写的话默认为80端口
external_url 'http://192.168.xxx.xxx'
#ssh主机ip
gitlab_rails['gitlab_ssh_host'] = '192.168.xxx.xxx'
#ssh连接端口
gitlab_rails['gitlab_shell_ssh_port'] = 9922
 
# 让配置生效
gitlab-ctl reconfigure
```

由于在容器中`/etc/gitlab/gitlab.rb`文件的配置会映射到`gitlab.yml`这个文件，由于咱在`docker中运行`生成的`url`地址应该是`http://192.168.xxx.xxx:9980`; 所以，要修改容器内文件 `/opt/gitlab/embedded/service/gitlab-rails/config/gitlab.yml`内容：

```yaml
gitlab:
  host: 192.168.xxx.xxx
  port: 9980 # 这里改为9980
  https: false
```

然后重启`gitlab`服务，退出容器:

``` bash
#重启gitlab 
gitlab-ctl restart

#退出容器 
exit
```


注意，第一次登录需要修改root密码：

```bash
# 进入容器内部
docker exec -it gitlab /bin/bash
 
# 进入控制台
gitlab-rails console -e production
 
# 查询id为1的用户，id为1的用户是超级管理员

user = User.where(id:1).first
# 修改密码为tz123456
user.password='tz123456'

# 保存,返回值为true表示设置成功了
user.save!
# 退出
exit
```

