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

下载镜像命令：

```bash
# 如果不指定 <image-tag>，则默认使用 latest
docker pull <image-name>:<image-tag>
```

为了能够在容器中使用`GPU`设备，`Nvidia`官方提供了一些常用镜像：
- [nvidia/cuda:xx.x.x-base-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=base-ubuntu)：包含了部署预构建`CUDA`应用程序的最低限度(`libcudart`)配置。
- [nvidia/cuda:xx.x.x-runtime-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=runtime-ubuntu)：基于 `base-ubuntu` 添加了 `CUDA` 工具包中的所有共享库扩展包。
- [nvidia/cuda:xx.x.x-devel-ubuntu xx.xx](https://hub.docker.com/r/nvidia/cuda/tags?page_size=&ordering=&name=devel-ubuntu)：基于 `runtime-ubuntu` 添加编译器工具链、调试工具、头文件和静态库的扩展，最直观的感受就是能够使用 `nvcc` 命令了。
- [lmsysorg/sglang:xxx](https://hub.docker.com/r/lmsysorg/sglang/tags)：`sglang` 框架的官方镜像，最常用的版本是 开发版(`dev`)、最新版(`latest`)。
- [vllm/vllm-openai:xxx](https://hub.docker.com/r/vllm/vllm-openai/tags)：`vllm`框架镜像，直接根据版本号查。
- [nvcr.io/nvidia/pytorch:xx.xx-py3](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags):是 `NVIDIA` 提供的一个 `Pytorch` 的 `Docker` 镜像。其中包含了 `Pytorch` 以及 `GPU` 相关的库，`xx.xx` 表示版本，`py3` 表示内置使用 `python3` 。


# docker常用命令&场景

## 基于镜像运行docker容器

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
- `--network host`：网络共享，使容器直接使用宿主机的网络;
- `-e <cv-name>=<cv-value>` 环境变量：设置容器内环境变量 `<cv-name>` 的值为 `<cv-value>` ，可多次添加;
- `--ipc=host`：进程间通信的命名空间共享，允许容器内的进程与宿主机上的进程进行通信，共享 `IPC` 命名空间;
- `--rm`：容器停止后自动删除;
- `--privileged`：权限


调试`sglang`容器命令:
```bash
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
```



# 构建镜像（`docker build` & `Dockerfile`）
在日常开发中，一般需要自己构建 (`build`) 镜像(`image`)，自己构建镜像可以安装特定版本的CUDA、软件、脚本等等。而构建镜像的过程就是基于`Dockerfile`的。

{% note danger %}
注意:这里的`Dockerfile`构建语法简单，如果想要优化Docker镜像大小和性能，可以考虑**多阶段构建**方案。
{% endnote %}

## Dockerfile语法
常用 `Dockerfile` 语法：
1. `FROM <base-image>:<tag>`：指定基础镜像，告诉 `Docker` 要基于哪个现有的镜像开始构建；
2. `WORKDIR /path/to/workdir`：设置工作目录，后续指令都会在这个目录下执行。如果目录不存在，`WORKDIR` 会自动创建；
3. `RUN <command>`：在镜像内部执行命令，每条 `RUN` 指令都会在当前镜像的基础上创建一个新的层。为了减少镜像层数和体积，加快构建速度，通常把多个 `apt-get install` 或者 `pip install` 命令用 `&&` 连在一条 `RUN` 指令里；
4. `COPY <host-path> <container-path>`：将宿主机的文件或目录复制到镜像内的指定路径；
5. `CMD ["command", "param1", "param2"]`：指定容器启动时默认执行的命令。还可写成 `CMD command param1 param2 (shell form)`。注意，一个 `Dockerfile` 里只能有一条 `CMD` 指令，如果有多条，只有最后一条生效。如果在 `docker run` 时指定了命令，那么 `CMD` 的命令会被覆盖；
6. `ENV <key>=<value>`：设置容器运行时的环境变量，镜像构建时不生效；
7. `ARG <key>=<value>`：设置镜像构建时的临时变量，容器运行时不生效；
8. `ENTRYPOINT ["command", "param1", "param2"]`：定义容器启动时默认执行的主命令，可以在启动命令 `docker run --entrypoint /bin/bash` 指定**显式覆盖**掉启默认主命令为`/bin/bash`;

# 镜像构建和同步共享

## 构建镜像（docker build）

在命令行构建指令 `docker build` 使用可以通过`docker build --help 查看`，这里列举最常用的：

```bash
docker build --build-arg <arg-key>=<arg-value>  -t <image-name>:<tag> -f <docker-file> <path>
```
说明：
- `--build-arg <arg-key>=<arg-value>`：构建镜像时候传给`Dockerfile`中的参数，可设置多个：`--build-arg <arg-key1>=<arg-value1> --build-arg <arg-key2>=<arg-value>2 ...`
- `-t <image-name>:<tag>`：镜像的名字和标签；
- `-f <docker-file>`：`Dockerfile` 的路径；
- `<path>`：指定 `Docker` 构建镜像时的构建上下文路径，即 `Docker` 可以访问的文件和目录的根路径。它决定了 `Dockerfile` 中文件引用（如 `COPY`、`ADD`）的查找范围。通常设为 `.` 表示当前目录，但也可以是其他本地目录或 `Git` 仓库 `URL`；
- `--no-cache`：构建过程中不使用缓存;
- `--progress=plain`：表示构建进度的输出模式，有`auto`, `plain`, `tty`;

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

docker save name -o 













