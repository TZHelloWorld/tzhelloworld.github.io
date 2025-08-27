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
这里对于`docker`的基本概念不过多补充, 主要是个人在使用 `docker` 过程中的常用场景和命令。需要提前了解下 **镜像** (`image`) 、**容器**(`container`) 以及 **仓库**(`Repository`) 的概念。
{% endnote %}

# 安装docker

根据官方 [Install Docker Engine](https://docs.docker.com/engine/install/)和[Install Docker Desktop](https://docs.docker.com/get-started/get-docker/) 介绍选择自己的主机安装即可。一般流程是先卸载旧版的`Docker Engine`然后安装。并且安装过程中需要 `root` 权限。而在使用的时候一般是普通用户权限，因此很容易遇到错误提示：

```bash
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.24/containers/json": dial unix /var/run/docker.sock: connect: permission denied
```

解决方案参考[https://docs.docker.com/engine/install/linux-postinstall/](https://docs.docker.com/engine/install/linux-postinstall/) ：通过创建一个 `docker` 用户组，并将普通用户加入到 `docker` 用户组即可。

# 下载docker镜像

一般是去[docker官网](https://hub.docker.com/) 搜索，然后通过下载镜像命令拉取到本地：

```bash
# 如果不指定 <image-tag>，则默认使用 latest
docker pull <image-name>:<image-tag>
```

为了能够在容器中使用`GPU`设备，`Nvidia`官方提供了一些常用镜像：
- [nvidia/cuda:xx.x.x-base-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=base-ubuntu)：包含了部署预构建`CUDA`应用程序的最低限度(`libcudart`)配置。
- [nvidia/cuda:xx.x.x-runtime-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=runtime-ubuntu)：基于 `base-ubuntu` 添加了 `CUDA` 工具包中的所有共享库扩展包。
- [nvidia/cuda:xx.x.x-devel-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=devel-ubuntu)：基于 `runtime-ubuntu` 添加编译器工具链、调试工具、头文件和静态库的扩展，最直观的感受就是能够使用 `nvcc` 命令了。
- [nvcr.io/nvidia/pytorch:xx.xx-py3](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags):是 `NVIDIA` 提供的一个 `Pytorch` 的 `Docker` 镜像。其中包含了 `Pytorch` 以及 `GPU` 相关的库，`xx.xx` 表示版本，`py3` 表示内置使用 `python3` 。

除此之外，还有：
- [lmsysorg/sglang:xxx](https://hub.docker.com/r/lmsysorg/sglang/tags)：`sglang` 框架的官方镜像，最常用的版本是开发版(`dev`)、最新版(`latest`)。
- [vllm/vllm-openai:xxx](https://hub.docker.com/r/vllm/vllm-openai/tags)：`vllm`框架镜像，直接根据版本号查。


# docker常用命令&场景

## 常用images命令
```bash
# 列出本地主机上的镜像列表
docker images

# 查询镜像
docker search <image-name>

# 删除镜像
docker rmi <image-name>

# 给镜像打标签
docker tag <image-ID> <image-name>:<new-tag>
```



## 基于镜像运行docker容器

### 语法说明

语法可以通过 `docker run --help` 查看:
```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

常用`OPTIONS`:
- `-itd`: `-it` 交互式终端，`-d`在后台运行容器，输入 `exit` 时容器不关闭;
- `--name <container-name>`：设置容器名;
- `--gpus all`:指定在容器中使用所有 `GPU`，也可以执行某一个GPU设备(如`--gpus "device=3"`)，或者某些GPU设备（如`--gpus "device=0,1,4"`）
- `--shm-size <shared-memory-size>` ：设置共享 `CPU` 内存大小;
- `-v <host-path>:<container-path>`：目录挂载，将宿主主机上的容器挂载到容器中，可多次添加;常用挂载路径有：
  - `-v $HOME/.cache/modelscope/:/root/.cache/modelscope`：宿主主机 `modelscope` 默认缓存路径;
  - `-v $HOME/.cache/huggingface/:/root/.cache/huggingface`：宿主主机 `huggingface` 默认缓存路径;
  - `$HOME/.ssh:/root/.ssh`：与宿主主机共享 `gitlab` | `github` 远程连接配置；
- `--network host`：网络共享，使容器直接使用宿主机的网络;
- `-p <host-ip>:<container-ip>`：端口映射将宿主主机端口 `<host-ip>` 映射到容器主机端口 `<container-ip>`;
- `-e <cv-name>=<cv-value>` 环境变量：设置容器内环境变量 `<cv-name>` 的值为 `<cv-value>` ，可多次添加;
- `--ipc=host`：进程间通信的命名空间共享，允许容器内的进程与宿主机上的进程进行通信，共享 `IPC` 命名空间;
- `--rm`：容器停止后自动删除;
- `--privileged=true`：特权，给容器所有宿主主机的权限。
- `--cap-add` 和 `--cap-drop`: 更细粒度的管理容器的权限（后面有详细介绍）。

### docker容器权限相关（Linux Capabilities）
{% note success %}
**注意**，这个 `Linux Capabilities` 是 `linux` 系统的本身的机制，`Docker` 容器只是利用了这套机制给容器赋予不同的权限罢了。 具体的操作，我使用起来也不是很上手，最大的需求就是需要在容器中访问宿主主机的内核文件:
- 访问宿主主机内核驱动模块：`Nsight Systems` 是 `NVIDIA` 的性能分析工具，用于 `GPU` 性能监控和指标采集。在容器中运行时，它需要访问 `GPU` 设备及相关的内核驱动模块，进而采集 `GPU` 芯片上的一些硬件统计指标。
- 使用网络设备：`InfiniBand` 是一种高性能网络设备，容器需直接访问 `IB` 硬件（如网卡、设备文件）进行网络通讯。

加上对安全考虑没那么重要，直接使用 `--cap-add CAP_SYS_ADMIN` 权限足以，甚至 `--privileged` 权限即可。
{% endnote %}

`Linux Capabilities` 是 `Linux` 内核中一种细粒度的权限管理机制，由 `Linux` 内核在 `2.2` 版本引入，其**目的是将传统的 `root` 用户的全部特权拆分为多个独立的能力**（如 `CAP_NET_ADMIN`、`CAP_SYS_ADMIN` 等）。这一机制允许普通用户或进程在不完全获取 `root` 权限的情况下，执行特定的系统级操作（如绑定特权端口、修改网络配置等）。根据 `Linux` 系统内核版本的不同，其拆分为独立的 `Capabilities` 个数也不尽相同（在 `Linux 5.x` 版本的内核中将传统的 `root` 用户的全部特权拆分为38项独立的能力）。**当使用 `--privileged` 时，`Docker` 会继承宿主机所有 `Capabilities` 并开放设备访问权限 ，等同于赋予容器完整的 `root` 权限**。

最常见的添加权限是 `CAP_SYS_ADMIN` ，这个属于**高危操作（涉及系统管理操作）**，如：
- 挂载/卸载文件系统（如 `mount`、`umount`）；
- 创建或修改内核参数（如 `sysctl`）；
- 调整进程的 `CPU` 亲和性（ `cpuset`）；
- 管理 `tmpfs` 或 `loop` 设备；
- 更改内核模块或硬件配置，等。

使用方式如下：
```bash
docker run --cap-add=SYS_ADMIN 。。。。
```

其实在 `Linux` 系统中，设备其实就是文件，在一定程度上通过精确挂载设备文件或目录可以避免使用 `CAP_SYS_ADMIN` 权限。但若需动态管理设备 或执行系统级操作 （如挂载文件系统、修改内核参数），则不可避免的需要 `CAP_SYS_ADMIN` 权限。



### 实际应用命令参考

调试`sglang`容器命令:
```bash
# 启动容器
docker run -itd \
    --gpus all \
    -v $HOME/.cache/modelscope/:/root/.cache/modelscope \
    -v $HOME/.cache/huggingface/:/root/.cache/huggingface \
    --ipc=host \
    --network=host \
    --privileged \
    --name sglang_dev \
    --entrypoint /bin/bash \
    lmsysorg/sglang:dev

# [可选] 进入容器，卸载并通过pip install -e重新安装sglang来调试修改代码
pip uninstall sglang

pip install -e "python[all]" -i https://pkgs.d.xiaomi.net/artifactory/api/pypi/pypi-virtual/simple

# 验证
python3 -m sglang.launch_server --help
```

## 常用容器命令
```bash
# 查看运行容器, -a表示所有容器（包含非运行状态）
docker ps [-a]

# 进入容器
docker exec -it [container] bash

# 启动、停止、重启、删除容器
docker start/stop/restart/rm [container]

# 查看容器日志, -f 表示实时
docker logs [-f] [container]

# 在宿主主机和容器间复制文件
docker cp [PATH] [container]:[PATH]

# 显示容器内进程
docker top [container]

# 显示容器内文件的变化
docker diff [container]

# 查看容器资源使用情况
docker stats [container]
```


## 虚悬镜像(dangling image)

`docker image ls` 列表中的镜像体积总和并非是所有镜像实际硬盘消耗。由于 `Docker` 镜像是多层存储结构，并且可以继承、复用，因此不同镜像可能会因为使用相同的基础镜像，从而拥有共同的层。基于`Docker` 使用 `Union FS`，相同的层只需要保存一份即可，因此实际镜像硬盘占用空间很可能要比这个列表镜像大小的总和要小的多。通过 `docker system df` 命令来便捷的查看镜像、容器、数据卷所占用的空间，如：
```bash
> docker system df

TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          411       114       2.236TB   1.664TB (74%)
Containers      250       56        3.037TB   827.5GB (27%)
Local Volumes   4         1         17.55MB   17.55MB (100%)
Build Cache     440       0         71.25GB   71.25GB
```

其实在通过 `docker images` 查看的时候会发现存在镜像名（`REPOSITORY`）和标签（`TAG`）都是 `<none>` 的镜像，这种就是**虚悬镜像**(`dangling image`)，可通过命令 `docker image ls -f dangling=true` 查看：

```bash
> docker image ls -f dangling=true

REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
<none>       <none>    63137b915ec3   34 hours ago   22.6GB
<none>       <none>    e7c32c97a146   3 days ago     27.2GB
```

这个其实会占用磁盘空间，删除全部虚悬镜像用特定的命令：

```bash
docker image prune
```

基于这个理论，也存在 `dangling container`、`dangling network`、`dangling volume`等等。可以通过命令删除这些占用的磁盘空间(**谨慎操作！！！**)

```bash
# --volumes  清理卷
# --force, -f  删除时不需要确认
docker system prune [--volumes] [-f]

# 单独清理所有停止的容器，受或不受 Swarm 管理的停止容器都会被删除
docker container prune

# 单独清理所有未使用的网络
docker network prune

# 单独清理所有未使用的本地卷
docker volume prune
```


# 构建镜像（`docker build` & `Dockerfile`）
在日常开发中，一般需要自己构建 (`build`) 镜像(`image`)，自己构建镜像可以安装特定版本的CUDA、软件、脚本等等。而构建镜像的过程就是基于`Dockerfile`的。

{% note success %}
注意:这里的`Dockerfile`构建语法简单，如果想要优化Docker镜像大小和性能，可以考虑 **多阶段构建** 等方案。
{% endnote %}

## Dockerfile语法

详细内容可以参考[docker-practice](https://docker-practice.github.io/zh-cn/image/dockerfile/)，常用 `Dockerfile` 语法有：
1. `FROM <base-image>:<tag>`：指定基础镜像，告诉 `Docker` 要基于哪个现有的镜像开始构建；
2. `WORKDIR /path/to/workdir`：设置工作目录，后续指令都会在这个目录下执行。如果目录不存在，`WORKDIR` 会自动创建；
3. `RUN <command>`：在镜像内部执行命令，每条 `RUN` 指令都会在当前镜像的基础上创建一个新的层。为了减少镜像层数和体积，加快构建速度，通常把多个 `apt-get install` 或者 `pip install` 命令用 `&&` 连在一条 `RUN` 指令里；
4. `COPY <host-path> <container-path>`：将宿主机的文件或目录复制到镜像内的指定路径；
5. `CMD ["command", "param1", "param2"]`：指定容器启动时默认执行的命令。还可写成 `CMD command param1 param2 (shell form)`。注意，一个 `Dockerfile` 里只能有一条 `CMD` 指令，如果有多条，只有最后一条生效。如果在 `docker run` 时指定了命令，那么 `CMD` 的命令会被覆盖；
6. `ENV <key>=<value>`：设置容器运行时的环境变量，镜像构建时不生效；
7. `ARG <key>=<value>`：设置镜像构建时的临时变量，容器运行时不生效；
8. `ENTRYPOINT ["command", "param1", "param2"]`：定义容器启动时默认执行的主命令，可以在启动命令 `docker run --entrypoint /bin/bash` 指定**显式覆盖**掉启默认主命令为`/bin/bash`;

## 常见 Dockerfile 编写参考

### 安装 python3.10+

`ubuntu20.04`远程仓库软件对应的`python`默认是`3.8`版本，而新的开发程序需要`Python3.10+`版本或者其他版本。就可以参考：

```Dockerfile
RUN apt-get update \
  && apt-get install -y git curl wget python3.10 libpython3.10-dev python3-pip \
  && apt-get install -y libgl1-mesa-glx libglib2.0-0 \
  && ln -sf /usr/bin/python3.10  /usr/bin/python3 \
  && ln -sf /usr/bin/python3.10  /usr/bin/python \
  && apt-get autoclean && rm -rf /var/lib/apt/lists/*

# pip设置国内源
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

或者源码编译编译安装：

```Dockerfile
ADD https://www.python.org/ftp/python/3.10.14/Python-3.10.14.tgz /usr/local/Python-3.10.14.tgz

RUN tar -zxvf Python-3.10.14.tgz && cd Python-3.10.14 && apt-get update \
    && apt-get install -y gcc g++ make libncurses5-dev libgdbm-dev liblzma-dev libz-dev libffi-dev libreadline-gplv2-dev tk-dev libc6-dev zlib1g-dev \
    && apt-get install -y checkinstall libdb-dev libexpat1-dev libncursesw5-dev libreadline-dev libsqlite3-dev libssl-dev libtinfo-dev libbz2-dev build-essential \
    && ./configure --prefix=/usr/local --enable-optimizations --with-ensurepip \
    && make -j4 && make install && cd ../ && rm -rf Python-3.10.14* \
    && apt-get autoclean && rm -rf /var/lib/apt/lists/*

# 需要单独安装pip软件包，注意在get-pip.py中有个地址指向国外源，可能会下载很慢
RUN curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py \
    && python3 get-pip.py && rm get-pip.py \
    && ln -sf /usr/local/bin/pip3 /usr/bin/pip \
    && apt-get autoclean && rm -rf /var/lib/apt/lists/*Dockerfile

# pip设置国内源
# 清华源
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 阿里源 
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ 
```

{% note success %}
通过 `https://bootstrap.pypa.io/get-pip.py`获取的脚本的主要功能是创建一个临时目录，将存储旧版本的 `pip` 文件编码 `DATA`转换后保存到该临时目录中，以生成一个 `pip` 程序。通过 `bootstrap` 函数在该临时目录中执行 `pip install` 命令，从而升级并重新安装最新的 `pip` 及用户指定的其他包。主要执行逻辑介绍：
1. 首先，从 `sys` 模块获取当前 `Python` 版本，并与最低要求的版本进行比较。如果当前版本低于要求，则输出错误信息并终止程序。
2. 定义两个辅助函数 `include_setuptools` 和 `include_wheel` ，用于判断是否需要安装 `setuptools` 和 `wheel` 包。
3. 通过 `determine_pip_install_arguments` 函数构建一个 `argparse` 对象来处理用户的命令行选项，**这里可以通过添加国内源 `args.extend(["--index-url","https://pypi.tuna.tsinghua.edu.cn/simple"])`来加速这一个下载过程**。
{% endnote %}

### Docker Build 时使用SSH私钥鉴权

在实际工作的时候，通过 `Docker Build` 镜像时，需要在`Docker` 镜像中用到 `SSH Private Key` 的场景。最常见的就是 `Clone gitlab` 私有仓库代码。如果直接将鉴权`SSH Private Key`打包到Docker镜像中，会存在很大风险。基于此，常用方案：
- 多阶段构建：在多阶段构建过程中，只要私钥不出现在最后一个阶段，都是比较安全的。
- `SSH mount type`：`Docker`在 `18.09` 版本后提出的新特性，具体参考：[SSH agent socket or keys to expose to the build (--ssh)](https://docs.docker.com/reference/cli/docker/buildx/build/#ssh)。

这里参考第二种使用`SSH mount type`方案：
1. 首先，需要在 Dockerfile 首行开启特性：
   ```dockerfile
   # syntax=docker/dockerfile:1
   ```
2. 然后添加下面的内容，下载对应网站的公钥
   ```dockerfile
   # 注意这个域名，这里使用 gitlab
   RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan gitlab.com >> ~/.ssh/known_hosts
   ```
3. 然后在 `Dockerfile` 需要使用 `SSH Private Key` 鉴权的命令前加上 `--mount=type=ssh`:
   ```dockerfile
   RUN --mount=type=ssh git clone xxx.xxx.git@gitlab.com
   ```
4. 最后在 `docker build` 时通过 `--ssh` 指定私钥：
   ```bash
   docker build -f Dockerfile -t <image-name>:<tag> . --ssh default=/root/.ssh/id_rsa
   ```

### 其他//todo

```dockerfile
FROM 




```






## 构建镜像（docker build）

在命令行构建指令 `docker build` 使用可以通过`docker build --help` 查看，这里列举最常用的：

```bash
docker build --build-arg <arg-key>=<arg-value>  -t <image-name>:<tag> -f <docker-file> <path>
```
说明：
- `--build-arg <arg-key>=<arg-value>`：构建镜像时候传给`Dockerfile`中的参数，可设置多个：`--build-arg <arg-key1>=<arg-value1> --build-arg <arg-key2>=<arg-value>2 ...`
- `-t <image-name>:<tag>`：镜像的名字和标签；
- `-f <docker-file>`：`Dockerfile` 的路径；
- `<path>`：指定 `Docker` 构建镜像时的构建上下文路径，即 `Docker` 可以访问的文件和目录的根路径。它决定了 `Dockerfile` 中文件引用（如 `COPY`、`ADD`）的查找范围。通常设为 `.` 表示当前目录，但也可以是其他本地目录或 `Git` 仓库 `URL`；
- `--no-cache`：构建过程中不使用缓存;
- `--progress=plain`：表示构建进度的输出模式（有的版本没这个参数），有`auto`, `plain`, `tty`;

## 构建调试

调试的原理主要是参考 [Docker build cache](https://docs.docker.com/build/cache/): `Docker` 采用分层文件系统架构（ `UnionFS`，联合文件系统），每个 `Dockerfile` 指令在执行后都会生成独立的**只读镜像层**（ 可以通过 `docker history <image_name>` 来查看这些镜像层 ）。这些层通过联合挂载形成最终镜像的文件系统。在构建过程中，所有中间层均会被保留作为缓存（除非显式使用 `--squash` 参数或手动清理缓存），且每个层都可作为临时镜像用于调试。通过指定构建阶段（使用 `--target` 参数）或直接引用层的 `SHA256` 标识符，可启动对应的中间容器检查文件系统状态。这种分层机制实现了高效的存储复用和构建缓存，同时为镜像调试提供了精确的层级追溯能力。

如有 `Dockerfile` 文件内容：
```bash
> cat Dockerfile            
FROM ubuntu
RUN echo "execute RUN1 command" >>/tmp/tmp.log
RUN ceho "execute RUN2 command" >>/tmp/tmp.log
```

很明显第二个执行命令拼写错误（`echo --> ceho`）,此时镜像构建日志如下：

```bash
Sending build context to Docker daemon  2.048kB
Step 1/3 : FROM ubuntu
 ---> bf16bdcff9c9
Step 2/3 : RUN echo "execute RUN1 command" >>/tmp/tmp.log
 ---> Running in b128dadaa9c1
 ---> Removed intermediate container b128dadaa9c1
 ---> 2e7f2122aea9
Step 3/3 : RUN ceho "execute RUN2 command" >>/tmp/tmp.log
 ---> Running in 941d167c1381
/bin/sh: 1: ceho: not found
The command '/bin/sh -c ceho "execute RUN2 command" >>/tmp/tmp.log' returned a non-zero code: 127
```

可以看到 `Step 2/3`是执行成功的，并且镜像是 `2e7f2122aea9`，因此可以基于这个去调试执行后续指令：

```bash
> docker run -it 2e7f2122aea9 cat "/tmp/tmp.log"
execute RUN1 command
```

# 镜像共享

## 镜像上传远程仓库

镜像构建好以后，我们可以把本地镜像 `docker push` 到远程镜像仓库，如 `Docker Hub` 等。
1. 首先需要**给镜像打标签**:对于 `Docker Hub`，镜像名通常是 `<dockerhub-username>/<repo-name>:<tag>`。 如果你在 `docker build` 时已经用了这个格式，那这步可以跳过。如果没用，或者你想推送到不同的仓库/用户下，就需要重新打标签。
   ```bash
   docker tag <source-image>:<tag> <target-image>:<tag>
   ```
2. **登录到镜像仓库**：在 `docker hub` 注册账号后，使用 `docker login` 在本地登录
   ```bash
   docker login
   ```
3. **推送镜像**：
   ```bash
   docker push <image-name>:<tag>
   ```

## 使用网络传输(保存到磁盘，并从磁盘导入镜像)

```bash
# 保存镜像到磁盘
docker save [image] -o FILE

# 将磁盘文件导入镜像
docker load -i FILE
```
