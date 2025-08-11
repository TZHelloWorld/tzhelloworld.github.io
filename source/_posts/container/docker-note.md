---
title: Docker
excerpt: '这个主要是梳理docker容器命令相关的内容'
index_img: /img/post/docker.svg
category_bar:
  - '容器'
categories:
  - 技术栈
  - 容器
tags:
  - Docker
date: 2025-06-23 22:44:53
updated:
sticky:
---

{% note success %}
这里对于`docker`的基本概念不过多补充, 主要是个人在使用 `docker` 过程中的常用场景和命令。主要需要了解下镜像 (`image`) 、容器(`container`) 以及 仓库(`Repository`) 的概念。
{% endnote %}

# 安装docker

根据官方 [Install Docker Engine](https://docs.docker.com/engine/install/)和[Install Docker Desktop](https://docs.docker.com/get-started/get-docker/) 介绍选择自己的主机选择安装即可。一般流程是先卸载旧版的`Docker Engine`，并且安装需要 `root` 权限。而在使用的时候一般是普通用户权限，就很容易遇到：

```bash
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.24/containers/json": dial unix /var/run/docker.sock: connect: permission denied
```

解决方案：参考[https://docs.docker.com/engine/install/linux-postinstall/](https://docs.docker.com/engine/install/linux-postinstall/) ，通过创建一个 `docker` 用户组，并将普通用户加入到 `docker` 用户组即可使用。

# 下载docker镜像




# docker常用命令&场景
## 基于容器运行docker镜像



# 构建镜像（`docker build` & `Dockerfile`）














