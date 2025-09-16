---
title: Linux 基础-文件权限及属性
excerpt: ''
index_img: /img/post/Linux.png
category_bar:
  - 'Linux'
categories:
  - 技术栈
  - Linux
tags:
  - Linux
date: 2025-09-16 22:54:46
updated:
sticky:
---

# 文件类型

`Linux` 的文件种类繁多，常用的是一般文件(`-`)与目录文件(`d`)

> 注意：`Linux` 文件类型和文件的文件名所代表的意义是两个不同的概念，在 `Linux` 中文件类型与文件扩展名没有关系。它不像 `Windows` 那样是依靠文件后缀名来区分文件类型的，在 `Linux` 中文件名只是为了方便操作而的取得名字。


`Linux` 文件类型常见的有：**普通文件**、**目录**、**字符设备文件**、**块设备文件**、**符号链接文件**等。查看文件类型方法: 可以使用 `ls -la` 命令列出的信息中第一栏十个字符中，第一个字符为文件的类型。

- 正规文件(regular file)
- 目录(directory)
- 链接文件(link)
- 设备与装置文件(device)
- 资料接口文件(sockets)
- 数据输送文件(FIFO, pipe)


# 文件属性与权限

## Linux 文件属性

## Linux 文件权限

