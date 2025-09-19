---
title: Linux 基础-查看和设置环境变量
excerpt: ''
index_img: /img/post/Linux.png
category_bar:
  - 'Linux'
categories:
  - 技术栈
  - Linux
tags:
  - Linux
date: 2025-09-16 22:58:17
updated:
sticky:
---

# 环境变量类型

1. 按照变量的**生存周期**划分，Linux 变量可分为两类
   - **永久生效**：添加到配置文件中，变量永久生效。
   - **临时生效**：使用 `expert` 命令声明，变量在关闭当前 `shell` 时候失效。
2. 按**作用的范围**划分，在 `Linux` 中的变量，可以分为
   - **环境变量**：相当于全局变量，存在于所有的 `Shell` 中，具有继承性。
   - **本地变量**：相当于局部变量只存在当前 `Shell` 中，本地变量包含环境变量，非环境变量不具有继承性。

环境变量名称一般都是大写，常用的环境变量和意义如下
- `PATH`：决定了 `shell` 将到哪些目录中寻找命令或程序。`shell` 会依次在 `PATH` 中的各个目录里查找对应的可执行文件，找到后立即运行。
- `HOME`：当前用户主目录
- `HISTSIZE`：历史记录数
- `LOGNAME`：当前用户的登录名
- `HOSTNAME`：指主机的名称;
- `SHELL`：当前用户 `shell` 类型，通过 `echo $SHELL` 查看，默认是 `/bin/bash`;
- `LANGUGE`：语言相关的环境变量，多语言可以修改此环境变量
- `MAIL`：当前用户的邮件存放目录
- `PS1`：基本提示符，对于 `root` 用户是 `#`，对于普通用户是 `$`

除此之外，还有编译和运行程序常涉及的环境变量（查找依赖库的路径）：
- `LIBRARY_PATH`：是**程序编译期间**查找动态链接库时指定查找共享库的路径
- `LD_LIBRARY_PATH`：是**程序加载运行期间**查找动态链接库时指定除了系统默认路径之外的其他路径


# 查看环境变量

环境变量可以由系统、用户、`Shell` 以及其他程序来设定，保存在变量 `PATH` 中。环境变量是一个可以被赋值的字符串，赋值范围包括数字、文本、文件名、设备以及其他类型的数据。
- 使用 `echo` 命令查看单个环境变量，例如：`echo $PATH`；
  ```bash
  # 查看 `PATH` 的环境变量
  >>> echo $PATH
  /usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  ```
- 使用 `env` 查看当前系统定义的所有环境变量；
  ```bash
  # 查看其中包含关键字 `PATH` 的环境变量
  >>> env |grep "PATH"
  LIBRARY_PATH=/usr/local/cuda/lib64/stubs
  LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
  PATH=/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  ```
- 使用 `set` 查看所有本地定义的环境变量。查看 `PATH` 环境的实例如下：
  ```bash
  # 查看其中包含关键字 `PATH` 的环境变量
  >>> set|grep "PATH" #
  LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
  LIBRARY_PATH=/usr/local/cuda/lib64/stubs
  PATH=/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin 
  ```
- 使用 `unset` 删除指定的环境变量，`set` 也可以设置某个环境变量的值。清除环境变量的值用 `unset` 命令。如果未指定值，则该变量值将被设为 `NULL`。如
  ```bash
  >>> export TZ_TEST="Test..."  # 增加一个环境变量 TZ_TEST
  >>> env|grep TEST  # 此命令有输入，证明环境变量 TZ_TEST 已经存在了
  TZ_TEST=Test...
  >>> unset  TZ_TEST  # 删除环境变量 TZ_TEST
  >>> env|grep TZ_TEST  # 此命令没有输出，证明环境变量 TZ_TEST 已经删除
  ```

# 设置环境变量

## 临时添加环境变量
`export` 命令用于设置或显示环境变量，其只在当前终端会话中的任意脚本都有效，但是仅限于该次登陆操作，换一个终端窗口则无效。未被 `export` 的普通变量则只作用于当前变量。

```bash
>>> echo $PATH  # 查看
/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
>>> export PATH=$PATH:/usr/local/cuda/lib64  # 添加环境变量
>>> echo $PATH  # 查看
/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/cuda/lib64
```

重新开一个终端窗口再次运行 `export | grep PATH` 就不会再有 `/usr/local/cuda/lib64` 环境变量了，因为通过 `export` 命令的是临时设置环境变量。

## 针对当前用户永久设置环境变量
将上述的 `export` 添加环境变量方式加入到配置文件中：
- `Bash` 终端：写入文件 `~/.bashrc` 或 `~/.bash_profile`；
- `Zsh` 终端：写入文件 `~/.zshrc`；


## 针对所有用户永久设置环境变量
  - `/etc/profile`：系统级的“登录 Shell”初始化脚本，在所有用户登录时被 Bash（及兼容 Bourne 的 Shell）读取，用于定义全局环境变量、`PATH`。
  - `~/.bash_profile`：当前用户的专属“登录 Bash Shell”初始化脚本，仅在交互式登录时被 Bash 读取，用以设置用户特有的环境变量、别名和启动行为；若存在，它将覆盖或补充 /etc/profile 中的配置


# 常见环境变量使用（汇总）

## Python环境变量

PYTHONPATH



## NCCL

参考：[NCCL Environment Variables](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/env.html)

最常用：
```bash
export NCCL_DEBUG=WARN # 设置日志级别，选择有 VERSION、WARN、INFO、TRACE
export NCCL_DEBUG_FILE=filename.%h.%p.log # 指定将NCCL日志输出到某个文件中,其中，%h表示主机名，%p表示进程PID
 
```
