---
title: 编译初探究之gcc&make&cmake
excerpt: ''
index_img: /img/post/cmake.svg
category_bar:
  - 'Linux'
categories:
  - 技术栈
  - Linux
tags:
  - Linux
  - gcc
  - 
date: 2025-07-02 23:36:52
updated:
sticky:
---

# GCC介绍

`GCC`：是 `GNU Compiler Collection`(`GNU` 编译器套装)缩写，一个由 `GNU` 开发用于 `Linux` 系统下编程的编译器。`GDB`是`GNU`开源组织发布的一个强大的`UNIX`下的程序调试工具。
* `gcc` 是 `GCC` 中的`GUNC Compiler`（`C` 编译器）
* `g++` 是 `GCC` 中的`GUN C++ Compiler`（`C++` 编译器）

{% note success %}
但是并 **不是说 `gcc` 编译 `c` 语言，`g++` 编译 `c++`。而是`gcc`调用了 `C compiler`，而 `g++` 调用了 `C++ compiler`。**主要区别在于： 
- 对于 `*.c` 和 `*.cpp` 文件，`gcc`分别当做`c`和`cpp`文件编译（c和cpp的语法强度是不一样的）
- 对于 `*.c`和`*.cpp`文件，`g++`则统一当做`cpp`文件编译
- 使用`g++`编译文件时，**g++会自动链接标准库STL，而gcc不会自动链接STL**
- `gcc` 在编译 `C` 文件时，可使用的预定义宏是比较少的
- `gcc` 在编译 `cpp` 文件时 / `g++` 在编译 `c` 文件和 `cpp` 文件时（这时候 `gcc` 和 `g++` 调用的都是 `cpp` 文件的编译器），会加入一些额外的宏。
- 在用 `gcc` 编译 `c++` 文件时，为了能够使用`STL`，需要加参数 `–lstdc++` ，但这并不代表 `gcc –lstdc++` 和 `g++` 等价，它们的区别不仅仅是这个。
{% endnote %}

# gcc

## gcc编译单个文件

创建一个单个文件，如 `vim hello.c` :
```C
#include<stdio.h>
int main(void){
	printf("hello,world.\n");
}
```

然后进行编译执行：

```bash
# 编译，会在当前生成名字为 a.out 的可执行二进制文件
gcc hello.c 

# 执行编译后的二进制文件
./a.out
```

## gcc编译两个文件

需要创建两个源码文件，`vim main.c`，内容如下：

```c
include<stdio.h>
int main(void){
	double angle;
	printf("main function is exec...\n");
	printf("input the angle:");
	scanf("%lf",&angle);
	sin_value(angle);
}
```
然后创建第二个源码文件，`vim seconds.c`:

```
#include<stdio.h>
#include<math.h>

#define PI 3.141592653 

void sin_value(double angle){
	printf("seconds fun is exec ...\n");
	printf("angle = %f, and sin(angle)=%f\n",angle,sin(PI / 180 * angle));
}
```

执行编译过程：
```bash
# 编译两个源码文件，生成对应的目标文件(结尾为.o)
gcc -c main.c seconds.c

# 链接两个目标文件，并生成可执行二进制文件，并命名为 binary
gcc -o binary main.o seconds.o -lm 

# 执行 
./binary
# 执行输出内容 =============>
main function is exec...
input the angle:30
seconds fun is exec ...
angle = 30.000000, and sin(angle)=0.500000
```

**说明**：上述过程中创建了两个源码文件，其中`main.c`文件中函数依赖于`seconds.c`文件中`sin_value(double angle)`函数。

首先是**编译过程**，通过`gcc -c`将源码文件编译成目标文件`main.o`和`seconds.o`。然后对目标文件进行**链接操作**，通过`gcc -o`将目标文件链接，并生成可执行文件`binary`。在链接过程中，由于`seconds.c`文件中调用了数学函数库`math.h`。需要依赖于外部的函数库。在`Linux`系统中，`gcc`默认会使用`/lib`和`/lib64`的函数库。如果要使用自定义位置的函数库，可通过`-L{Path}`来添加；当然可以通过`-I{Path}`来指定`include`文件的目录（这个默认使用的是`/usr/include`）。对于使用数学函数库`math.h`可以通过加`-lm`来指定，也就是表示要使用`libm.so`这个函数库。


# make
其实对于上述`gcc`编译两个文件例子中，如果每次修改了源码，都需要重新执行`编译`和`链接`两个过程。如果一旦源码文件很多了，重复操作很繁琐。就可以通过`make`来一个步骤完成（使用`makefile`文件然后使用`make`宏编译）。在一些最小安装的`Linux`系统中，默认是不安装`make`的（`Ubuntu`安装`make`可通过：`sudo apt-get install make`）。

## 使用make编译小例子

在目录中创建一个`makefile`文件, `vim makefile`, 且内容如下(注意: 在每个 `targets(main,clean)` 下面一行都有个`<tab>`)：

```makefile
main: main.o seconds.o
    gcc -o binary main.o seconds.o -lm
clean:
    rm -f binary main.o seconds.o
```

然后需要通过`cmake`进行编译:

```bash
# 编译，也就是执行main的指令，等价于make main
make 

# 清理，也就是执行clean下的指令。
make clean 
```
**注意**，默认使用的文件名为`makefile`，当然可以在`make`时候通过添加参数`-f`指定文件名，比如`Makefile`文件编译可通过:`make -f Makefile clean`，并且如果`makefile`文件内容很多，导致运行过程中不知道有多少个`targets`，可以通过`make <tab>`来通过`Bash`补全。

## makefile语法

`makefile`的基本语法规则为：

```makefile
target: 目标文件1 目标文件2...
	gcc -o 可执行文件的名字 目标文件1 目标文件2... 等
```
在`makefile`文件中注释是`#`，并且一个文件中可以建立多个`target`。`make`默认的`target`是`main`。在 `makefile` 文件中也可以定义变量，通过 `=` 来设置，并且使用 `${}` 或者 `$()` 来使用变量。

# cmake

当工程量很大的时候，手写`makefile`又是一个很繁琐且枯燥的工作。如果换了一个平台，可能又得重新编写`makefile`（依赖库环境等不同导致）。如果软件想跨平台，必须要保证能够在不同平台编译。而如果使用`make`工具，就得为每一种标准写一次`makefile` ，这将是一件让人抓狂的工作。因此，就衍生出来了`cmake`。其功能主要是通过`cmake`侦察工作环境，自动生成一个`makefile`文件，以便`make`工具使用。
{% note success %}
除此之外，也有通过编写脚本去侦测工作环境。比如`configure`或`config`，侦测完成后，创建`makefile`文件。也有由`QT`提供的一个编译打包工具`qmake`，编译`pro`项目生成`makefile`文件。
{% endnote %}

## 使用步骤
在`linux`平台下使用`CMake`生成`Makefile`并编译的流程如下：
1.  写`cmake`配置文件`CMakeLists.txt`。
2.  执行命令 `cmake PATH` 或者 `ccmake PATH` 或者`cmake-gui`生成 `Makefile`（`ccmake` 和 `cmake` 的区别在于前者提供了一个交互式的界面，而`cmake-gui`则是直接使用`GUI`界面操作）。其中， `PATH` 是 `CMakeLists.txt` 所在的目录。
3.  使用 `make` 命令进行编译。

![使用make编译流程](<../../img/assets/cmake-compiler/Pasted image 20230305144307.png>)

## `CMakeLists.txt`文件编写规则

CMake的命令有不同类型，包括**脚本命令、项目配置命令和测试命令**，具体可以参考官网：[CMake 教程 — CMake 3.26.0-rc5 文档](https://cmake.org/cmake/help/latest/guide/tutorial/index.html)

这里创建一个最简单的文件`main.c`，内容如下：

```c
#include <stdio.h>
int main(){
	for(int i = 1; i < 100; ++i){
		printf("%d\n",i);
	}
}
```

在同一目录下创建`CMakeLists.txt`文件，且内容如下：

```cpp
# CMake 最低版本号要求
cmake_minimum_required (VERSION 2.8)

# 项目信息
project (Demo_for)

# 指定生成目标
add_executable(Demo main.c)
```
说明：
1. `cmake_minimum_required`：指定运行此配置文件所需的`CMake`的最低版本；
2. `project`：参数值是 `Demo_for`，该命令表示项目的名称是 `Demo_for` 。
3. `add_executable`：将名为`main.c`的源文件编译成一个名称为`Demo`的可执行文件。

## cmake的使用
```bash
# 查看当前文件
> ls
CMakeLists.txt  main.c

> cmake .   # <=== 制作makefile开始，在当前文件夹下找CMakeLists.txt文件
CMake Deprecation Warning at CMakeLists.txt:2 (cmake_minimum_required):
  Compatibility with CMake < 2.8.12 will be removed from a future version of
  CMake.

  Update the VERSION argument <min> value or use a ...<max> suffix to tell
  CMake that the project does not need compatibility with older versions.


-- The C compiler identification is GNU 11.3.0
-- The CXX compiler identification is GNU 11.3.0
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Check for working C compiler: /usr/bin/cc - skipped
-- Detecting C compile features
-- Detecting C compile features - done
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /usr/bin/c++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Configuring done
-- Generating done
-- Build files have been written to: /cmake

> ll  # 编译完成后新增加内容。
-rw-rw-r-- 1 user user 13785  3月  5 15:00 CMakeCache.txt
drwxrwxr-x 5 user user  4096  3月  5 15:00 CMakeFiles/
-rw-rw-r-- 1 user user  1634  3月  5 15:00 cmake_install.cmake
-rw-rw-r-- 1 user user   150  3月  5 14:55 CMakeLists.txt
-rw-rw-r-- 1 user user    87  3月  5 14:48 main.c
-rw-rw-r-- 1 user user  5065  3月  5 15:00 Makefile
```
**说明**，上述内容中，通过`cmake`指令对源程序`main.c`以及对应的`CMakeLists.txt`生成在该环境下的`makefile`，该过程中生成了一些`CMakeCache`等文件。其作用如下：
   1. `CMakeCache.txt`：`CMake`中的缓存变量都会保存在`CMakeCache.txt`文件中。
   2. `CMakeFIles/`：包含由`CMake`在配置期间生成的临时文件。
   3. `cmake_install.cmake`：`CMake`脚本处理安装规则，并在安装时使用。

在`Ubuntu`中默认是不安装`cmake`的，安装如下：`sudo apt-get install cmake`
> 在使用`cmake`过程中可以指定参数`-G`、`--build`等，其他具体内容也可以查看官网或者使用`man cmake`在系统中查看。

## ccmake的使用
![ccmake的使用流程](<../../img/assets/cmake-compiler/Pasted image 20230306100155.png>)

`ccmake`有两种用法:
1. 方案一：通过直接对`CMakeLists.txt`文件生成`makefile`文件。相对于`cmake`而言，其提供了一种字符界面的`GUI`操作面板。更加直观。
2. 方案二：对`cmake`操作过后的`cache`文件进行修改，重新生成`makefile`文件。

{% note success %}
方案一可以理解为从无到有的生成，而方案二则可以理解为修改默认配置文件，类似于去`modify`。

除此之外，`ccmake`包含在`cmake-curses-gui`包中，所以安装命令：`sudo apt-get install cmake-cures-gui`
{% endnote %}

这里首先对方案一进行展示使用过程：
```shell
> ls
CMakeLists.txt  main.c

> ccmake .
EMPTY CACHE

EMPTY CACHE: 
Keys: [enter] Edit an entry [d] Delete an entry 
CMake Version 3.22.1
      [l] Show log output   [c] Configure
      [h] Help              [q] Quit without generating
      [t] Toggle advanced mode (currently off)

> c  # <==键盘输入c表示配置

CMake Deprecation Warning at CMakeLists.txt:2 (cmake_minimum_required):
   Compatibility with CMake < 2.8.12 will be removed from a future version of
   CMake.

   Update the VERSION argument <min> value or use a ...<max> suffix to tell
   CMake that the project does not need compatibility with older versions.

 The C compiler identification is GNU 11.3.0
 The CXX compiler identification is GNU 11.3.0
 Detecting C compiler ABI info
 Detecting C compiler ABI info - done
 Check for working C compiler: /usr/bin/cc - skipped
 Detecting C compile features
 Detecting C compile features - done
 Detecting CXX compiler ABI info
 Detecting CXX compiler ABI info - done
 Check for working CXX compiler: /usr/bin/c++ - skipped
 Detecting CXX compile features
 Detecting CXX compile features - done
 Configuring done

> g #<==生成，这里有个问题，得重复按两下c才会出现[g]选项。
                                                     Page 1 of 1
 CMAKE_BUILD_TYPE
 CMAKE_INSTALL_PREFIX             /usr/local

CMAKE_BUILD_TYPE: Choose the type of build, options are: None Debug Release RelWithDebInfo MinSizeRel ...  
Keys: [enter] Edit an entry [d] Delete an entry 
CMake Version 3.22.1
      [l] Show log output   [c] Configure       [g] Generate
      [h] Help              [q] Quit without generating
      [t] Toggle advanced mode (currently off)
```
注意这里，当点击`c`后会自动配置内容，但是并不会出现`[g]`选项。这时候需要重新使用`[c]`选项，然后`[e]`退出后就会出现`[g] Generate`选项。

## cmake-gui的使用

这个是一个基于`QT`的`GUI`界面。在`Ubuntu`中安装如下：`sudo apt  install cmake-qt-gui`，使用的时候直接命令：`cmake-gui`提供一个`GUI`界面。点击操作就行。

![cmake-gui使用界面](<../../img/assets/cmake-compiler/Pasted image 20230306111412.png>)


# 扩展内容

## 静态链接库&动态链接库
在C/C++中，项目最终都会分成两个部分内容，一个是`头文件( .h )`，一部分是`源文件( .cpp)` 。 如果要编写好的功能给其他程序使用，通常会把源文件打包形成一个`动态链接库文件(.so .a）`文件 。 值得注意的是，头文件一般不会打包到链接库中，因为头文件仅仅只是声明而已。而库是别人写好的现有的，成熟的，可以复用的代码。现实中每个程序都要依赖很多基础的底层库，不可能每个人的代码都从零开始，因此库的存在意义非同寻常。本质上来说库是一种可执行代码的二进制形式，可以被操作系统载入内存执行。库有两种：`静态库（.a、.lib）` 和 `动态库（.so、.dll）`链接库也增加了代码的重用性、提高编码的效率，也可看看成是对源码的一种保护。

> 在`windows`上库名对应的是 `.lib`，`.dll`。而在`linux`上库对应的是 `.a`，`.so`

库包含`静态链接库`和`动态链接库`两种。
### 静态链接库

在链接阶段，将源文件中用到的库函数与汇编生成的`目标文件.o`合并生成可执行文件。该可执行文件可能会比较大。
这种链接方式的**好处**是：方便程序移植，因为可执行程序与库函数再无关系，放在如何环境当中都可以执行。
**缺点**是：文件太大，一个全静态方式生成的简单print文件远大于动态链接生成的一样的可执行文件。（类似于一个是值传递，而另一个则是直接引用了地址而已，用的时候根据地址而加入该功能）。而且如果静态库liba.lib更新了，所以使用它的应用程序都需要重新编译、发布给用户。 
> `linux`下的静态库文件是`.a`，而`windows`的静态库文件是`.lib`


### 动态链接库

动态链接的基本思想是把程序按照模块拆分成各个相对独立部分，在程序运行时才将它们链接在一起形成一个完整的程序，而不是像静态链接一样把所有程序模块都链接成一个单独的可执行文件。也就是说程序在**运行时**由系统**动态加载**动态库到内存，供程序调用。 

### 如何导入库

导入依赖库，需要导入两个部分的内容：**头文件**和**源文件**。源文件一般已经被打成了`.so`文件，所以实际上就是导入**头文件**和导入`.so`文件。
1. 导入**头文件**：头文件一般会放置在一个文件夹`include`中，可以把这个文件夹拷贝到工程内部，也可以放置在外部磁盘上，只需要指定地址找到它即可。
2. 导入**源文件**(库文件)：如果只导入了头文件，而没有到实现文件，那么会抛出异常，比如：**xxx未定义之类的错误**。因此需要导入对应的源文件（一般是`.so`文件）

库文件在链接（静态库和共享库）和运行（仅限于使用共享库的程序）时被使用，其搜索路径是在系统中进行设置的。**一般 `Linux` 系统把`/lib`和`/usr/lib`两个目录作为默认的库搜索路径，所以使用这两个目录中的库时不需要进行设置搜索路径即可直接使用**。但是，对于处于默认库搜索路径之外的库，就需要将库的位置添加到库的搜索路径之中。

可以将头文件路径和库文件路径添加到指定的系统环境变量中去，具体如下：
1. 使用`gcc`编译时将`头文件`路径添加到`C_INCLUDE_PATH`系统环境变量中；
2. 使用`g++`编译时将`头文件`路径添加到`CPLUS_INCLUDE_PATH`系统环境变量中；
3. 将`动态连接库`路径添加到`LD_LIBRARY_PATH`系统环境变量中；
4. 将`静态库`路径添加到`LIBRARY_PATH`系统变量中。

{% note success %}

改变系统变量主要有两种形式，一种是临时改变，另一种是永久改变。临时改变系统变量只需要使用`export`命令，重启终端后将恢复至先前状态，如`export C_INCLUDE_PATH=$CPLUS_INCLUDE_PATH:/myinclude`（在原有基础上添加了`/myinclude`目录），而永久改变主要是将`export`命令写到系统文件中：如`/etc/profile`、`/etc/export`、`~/.bashrc`或者`~/.bash_profile`等等。

`~/.bashrc`在每次登陆和每次打开`shell`都读取一次，而`~/.bash_profile`只在登陆时读取一次。但是对于嵌入式Linux来说，有些文件可能没有，这就需要根据目标机器的情况来设置了。
对于`/etc/profile`、`/etc/export`文件中加入`export`命令，是对所有用户而言的，而`~/.bashrc`和`~/.bash_profile`是对当前用户起作用。
{% endnote %}

## Linux中的交叉编译

就是说，假如我有个开发板，但是开发板上的资源很少（内存和存储空间），如果在开发板上又编译又链接又安装的，所需要的资源是很多的（编译过程产生的中间数据），因此，考虑使用一台单独电脑去编译和链接其源程序，然后将编译好的程序交给开发板，这样就可以减少开发板上编译链接所产生的数据。



