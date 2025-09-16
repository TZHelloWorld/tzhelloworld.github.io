---
title: Linux 基础-软件版本管理工具update-alternatives
excerpt: ''
index_img: /img/post/Linux.png
category_bar:
  - 'Linux'
categories:
  - 技术栈
  - Linux
tags:
  - Linux
  - update-alternatives
date: 2025-09-16 22:37:58
updated:
sticky:
---

系统上往往会安装同一个工具的多个版本。为了让管理员可以选择，以及能一起安装和使用多个不同的版本，备选项系统提供了以一致的方式管理此类版本的功能。update-alternatives 是 Linux 系统中专门维护系统命令链接符的工具，通过它可以很方便的设置系统默认使用哪个命令、哪个软件版本，比如系统中同时安装了多个python版本库（python2.7和python3.10），那么就可以通过 update-alternatives 指定用哪个版本。


update-alternatives命令的几个主要选项为：display、install、remove、config。
- `display` 选项用来显示一个命令链接的所有可选命令，即查看一个命令链接组的所有信息，包括链接的模式(自动还是手动)、链接priority值、所有可 用的链接命令等等。
- `install` 选项的功能就是增加一组新的系统命令链接符。
- `config` 选项用来显示和修改实际指向的候选命令，为在现有的命令链接选择一个作为系统默认。
- `remove`



工作原理：
在 /etc/alternatives 存放软链接 link_name，指向实际的可执行文件 command-version-x. 在 /usr/bin 目录下存放软链接 command_name 指向 /etc/alternatives/link_name.

## 查看

```bash
# 这里只考虑Ubuntu系统，查看所有已经被 alternatives 接管的链接
>>> ll /etc/alternatives/
total 12
drwxr-xr-x 1 root root 4096 Feb  6  2025 ./
drwxr-xr-x 1 root root 4096 Sep 15 23:43 ../
-rw-r--r-- 1 root root  100 Apr  6  2022 README
lrwxrwxrwx 1 root root   13 Oct  3  2023 awk -> /usr/bin/mawk*
lrwxrwxrwx 1 root root   12 Nov  9  2023 c++ -> /usr/bin/g++*
lrwxrwxrwx 1 root root   16 Nov  9  2023 c89 -> /usr/bin/c89-gcc*
lrwxrwxrwx 1 root root   16 Nov  9  2023 c99 -> /usr/bin/c99-gcc*
lrwxrwxrwx 1 root root   12 Nov  9  2023 cc -> /usr/bin/gcc*
lrwxrwxrwx 1 root root   12 Nov  9  2023 cpp -> /usr/bin/cpp*
lrwxrwxrwx 1 root root   20 Nov  9  2023 cuda -> /usr/local/cuda-12.1/
lrwxrwxrwx 1 root root   20 Nov  9  2023 cuda-12 -> /usr/local/cuda-12.1/
lrwxrwxrwx 1 root root   36 Nov  9  2023 cufile.json -> /usr/local/cuda-12.1/gds/cufile.json
lrwxrwxrwx 1 root root   18 Feb  6  2025 editor -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   18 Feb  6  2025 ex -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   43 Feb  6  2025 libblas.so.3-x86_64-linux-gnu -> /usr/lib/x86_64-linux-gnu/blas/libblas.so.3
lrwxrwxrwx 1 root root   47 Feb  6  2025 liblapack.so.3-x86_64-linux-gnu -> /usr/lib/x86_64-linux-gnu/lapack/liblapack.so.3
lrwxrwxrwx 1 root root   14 Nov  9  2023 lzcat -> /usr/bin/xzcat*
lrwxrwxrwx 1 root root   14 Nov  9  2023 lzcmp -> /usr/bin/xzcmp*
lrwxrwxrwx 1 root root   15 Nov  9  2023 lzdiff -> /usr/bin/xzdiff*
lrwxrwxrwx 1 root root   16 Nov  9  2023 lzegrep -> /usr/bin/xzegrep*
lrwxrwxrwx 1 root root   16 Nov  9  2023 lzfgrep -> /usr/bin/xzfgrep*
lrwxrwxrwx 1 root root   15 Nov  9  2023 lzgrep -> /usr/bin/xzgrep*
lrwxrwxrwx 1 root root   15 Nov  9  2023 lzless -> /usr/bin/xzless*
lrwxrwxrwx 1 root root   11 Nov  9  2023 lzma -> /usr/bin/xz*
lrwxrwxrwx 1 root root   15 Nov  9  2023 lzmore -> /usr/bin/xzmore*
lrwxrwxrwx 1 root root   13 Oct  3  2023 nawk -> /usr/bin/mawk*
lrwxrwxrwx 1 root root   20 Feb  6  2025 open -> /usr/bin/run-mailcap*
lrwxrwxrwx 1 root root   13 Feb  6  2025 pager -> /usr/bin/less*
lrwxrwxrwx 1 root root   24 Nov  9  2023 pinentry -> /usr/bin/pinentry-curses*
lrwxrwxrwx 1 root root   19 Feb  6  2025 python3 -> /usr/bin/python3.12*
lrwxrwxrwx 1 root root   12 Feb  6  2025 rcp -> /usr/bin/scp*
lrwxrwxrwx 1 root root   15 Feb  6  2025 rlogin -> /usr/bin/slogin*
lrwxrwxrwx 1 root root   17 Oct  3  2023 rmt -> /usr/sbin/rmt-tar*
lrwxrwxrwx 1 root root   12 Feb  6  2025 rsh -> /usr/bin/ssh*
lrwxrwxrwx 1 root root   18 Feb  6  2025 rview -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   18 Feb  6  2025 rvim -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   13 Nov  9  2023 unlzma -> /usr/bin/unxz*
lrwxrwxrwx 1 root root   18 Feb  6  2025 vi -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   18 Feb  6  2025 view -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   18 Feb  6  2025 vim -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   18 Feb  6  2025 vimdiff -> /usr/bin/vim.basic*
lrwxrwxrwx 1 root root   26 Oct  3  2023 which -> /usr/bin/which.debianutils*



# 或者通过提供的 update-alternatives 命令查看
>>> update-alternatives --get-selections
awk                            auto     /usr/bin/mawk
c++                            auto     /usr/bin/g++
c89                            auto     /usr/bin/c89-gcc
c99                            auto     /usr/bin/c99-gcc
cc                             auto     /usr/bin/gcc
cpp                            auto     /usr/bin/cpp
cuda                           auto     /usr/local/cuda-12.1
cuda-12                        auto     /usr/local/cuda-12.1
cufile.json                    auto     /usr/local/cuda-12.1/gds/cufile.json
editor                         auto     /usr/bin/vim.basic
ex                             auto     /usr/bin/vim.basic
libblas.so.3-x86_64-linux-gnu  auto     /usr/lib/x86_64-linux-gnu/blas/libblas.so.3
liblapack.so.3-x86_64-linux-gnu auto     /usr/lib/x86_64-linux-gnu/lapack/liblapack.so.3
lzma                           auto     /usr/bin/xz
open                           auto     /usr/bin/run-mailcap
pager                          auto     /usr/bin/less
pinentry                       auto     /usr/bin/pinentry-curses
python3                        manual   /usr/bin/python3.12
rcp                            auto     /usr/bin/scp
rlogin                         auto     /usr/bin/slogin
rmt                            auto     /usr/sbin/rmt-tar
rsh                            auto     /usr/bin/ssh
rview                          auto     /usr/bin/vim.basic
rvim                           auto     /usr/bin/vim.basic
vi                             auto     /usr/bin/vim.basic
view                           auto     /usr/bin/vim.basic
vim                            auto     /usr/bin/vim.basic
vimdiff                        auto     /usr/bin/vim.basic
which                          auto     /usr/bin/which.debianutils

# 显示 cuda 的链接情况
>>> update-alternatives --list cuda


# 单独显示 cuda 命令的所有链接情况
>>> update-alternatives --display cuda
cuda - auto mode
  link best version is /usr/local/cuda-12.1
  link currently points to /usr/local/cuda-12.1
  link cuda is /usr/local/cuda
/usr/local/cuda-12.1 - priority 121


# 当然可以通过readlink直接查看
>>> readlink --canonicalize /usr/local/cuda
/usr/local/cuda-12.1

```

## 设置备选项的默认版本

```bash
# 添加基本用法为：
update-alternatives --install <link> <name> <path> <priority> [--force]
# 如：
update-alternatives --install /usr/bin/cmake cmake /usr/local/bin/cmake 1 --force
# /usr/bin/cmake 为链接的名字
# cmake 指定在 alternatives 文件夹下的名字
# path 为实际文件路径
# priority 给当前的实际文件指定一个值，值越大，权限越高

# 配置：
update-alternatives --config cuda
```

