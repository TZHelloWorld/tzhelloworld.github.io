---
title: hexo内容编写
excerpt: '这个主要是记录一些比较好用的写博客方式'
index_img: /img/post/hexo.jpg
category_bar: ["博客"]
categories: 
  - 技术栈
  - 博客
tags:
  - Hexo
date: 2025-05-27 20:38:43
updated:
sticky:
---
{% note success %}
这个主要是用于一些 `markdown` 和 `html` 编写内容的参考（包括原生的和自定义扩展的）
{% endnote %}


# 代码块

代码块实现方式有两种：
```markdown
{% codeblock lang:python %}
import torch
torch.tensor([1,2,3],device="cuda")
{% endcodeblock %}
```


或者使用<span class="label label-success">```</span>这种`markdown`语法来编写使用，渲染效果如下：
{% codeblock lang:python %}
import torch
torch.tensor([1,2,3],device="cuda")
{% endcodeblock %}

# 选项卡支持多代码切换

## 单独使用
```markdown
{% tabs Name, 1 %}

<!-- tab python-->
因为冲突，这里添加 python 代码块

<!-- endtab -->


<!-- tab C++-->
因为冲突，这里添加 c++ 代码块
<!-- endtab -->

<!-- tab Java-->
因为冲突，这里添加 java 代码块
<!-- endtab -->

{% endtabs %}

```

渲染如下：

{% tabs Name, 1 %}

<!-- tab python-->

```python
print("Hello World")
```

<!-- endtab -->


<!-- tab C++-->
```c++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
```
<!-- endtab -->

<!-- tab Java-->
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```
<!-- endtab -->

{% endtabs %}


## 配合折叠块使用

```
<details>
<summary><b>代码块切换折叠隐藏</b></summary>
{% tabs Name, 1 %}

<!-- tab python-->
因为冲突，这里添加 python 代码块

<!-- endtab -->


<!-- tab C++-->
因为冲突，这里添加 c++ 代码块
<!-- endtab -->

<!-- tab Java-->
因为冲突，这里添加 java 代码块
<!-- endtab -->

{% endtabs %}
</details>

```

渲染如下：
<details>
<summary><b>代码块切换折叠隐藏</b></summary>


{% tabs Name, 1 %}

<!-- tab python-->

```python
print("Hello World")
```

<!-- endtab -->


<!-- tab C++-->
```c++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
```
<!-- endtab -->

<!-- tab Java-->
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```
<!-- endtab -->

{% endtabs %}
</details>


## 配合高亮块使用

```
{% note success %}


{% tabs Name, 1 %}

<!-- tab python-->
因为冲突，这里添加 python 代码块

<!-- endtab -->


<!-- tab C++-->
因为冲突，这里添加 c++ 代码块
<!-- endtab -->

<!-- tab Java-->
因为冲突，这里添加 java 代码块
<!-- endtab -->

{% endtabs %}

{% endnote %}

```

渲染如下：



{% note success %}

{% tabs Name, 1 %}

<!-- tab python-->

```python
print("Hello World")
```

<!-- endtab -->


<!-- tab C++-->
```c++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
```
<!-- endtab -->

<!-- tab Java-->
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```
<!-- endtab -->

{% endtabs %}


{% endnote %}



# 组图

```markdown
{% gi total n1-n2-... %}
  ![](url)
  ![](url)
  ![](url)
  ![](url)
  ![](url)
{% endgi %}
```
说明：
- `total`:表示图片总数量
- `n1-n2-...`：表示每行的图片数量，可以省略，默认一行最多3张，并且所有的和等于`total`，否则按默认样式。




# 高亮块（便签）

在 `markdown` 中加入如下的代码来使用便签：

```markdown
{% note success %}
文字 或者 `markdown` 均可
{% endnote %}
```

或者使用 `HTML` 形式：

```html
<p class="note note-success">标签</p>
```

可选择的有：
<p class="note note-primary">primary</p>
<p class="note note-secondary">secondary</p>
<p class="note note-success">success</p>
<p class="note note-danger">danger</p>
<p class="note note-warning">warning</p>
<p class="note note-info">info</p>
<p class="note note-light">light</p>

# 行内标签

在 `markdown` 中加入如下的代码来使用 `Label`：
```markdown
{% label primary @text %}
```
或者使用 `HTML` 形式：
```html
<span class="label label-primary">Label</span>
```

可选 `Label`：

1. <span class="label label-primary">primary</span>
2. <span class="label label-default">default</span>
3. <span class="label label-info">info</span>
4. <span class="label label-success">success</span>
5. <span class="label label-warning">warning</span>
6. <span class="label label-dange">dange</span>


# 折叠块
## HTML使用方式

Fluid 没有原生的折叠块支持，但是可以通过内嵌 `HTML` 代码实现，可以用使用 `Tag` 便签包裹：
```markdown
<details>
<summary><b>折叠快，点击查看详细</b></summary>
这个默认不被打开
</details>

```
渲染如下：
<details>
<summary><b>折叠快，点击查看详细</b></summary>
这个默认不被打开
</details>


## 配合高亮块使用
```markdown
{% note secondary %}
<details>
<summary><b>折叠快，点击查看详细</b></summary>
这个默认不被打开
</details>
{% endnote %}
```
渲染如下：
{% note secondary %}
<details>
<summary><b>折叠快，点击查看详细</b></summary>
这个默认不被打开
</details>
{% endnote %}


## 配合代码块使用
```markdown
<details>
<summary><b>折叠快，点击查看详细</b></summary>

**因为冲突，这里添加代码块**

</details>
```



<details>
<summary>OpenRLHF 的 VLLM Worker Wrap</summary>

```python
class WorkerWrap(Worker):
    def init_process_group(self, master_address, master_port, rank_offset, world_size, group_name, backend="nccl"):
        """Init torch process group for model weights update"""
        assert torch.distributed.is_initialized(), f"default torch process group must be initialized"
        assert group_name != "", f"group name must not be empty"

        rank = torch.distributed.get_rank() + rank_offset
        self._model_update_group = init_process_group(
            backend=backend,
            init_method=f"tcp://{master_address}:{master_port}",
            world_size=world_size,
            rank=rank,
            group_name=group_name,
        )
        print(
            f"init_process_group: master_address={master_address}, master_port={master_port}, ",
            f"rank={rank}, world_size={world_size}, group_name={group_name}",
        )

    def update_weight(self, name, dtype, shape, empty_cache=False):
        """Broadcast weight to all vllm workers from source rank 0 (actor model)"""
        if torch.distributed.get_rank() == 0:
            print(f"update weight: {name}, dtype: {dtype}, shape: {shape}")

        assert dtype == self.model_config.dtype, f"mismatch dtype: src {dtype}, dst {self.model_config.dtype}"
        weight = torch.empty(shape, dtype=dtype, device="cuda")
        torch.distributed.broadcast(weight, 0, group=self._model_update_group)

        self.model_runner.model.load_weights(weights=[(name, weight)])
```

</details>


## 另一种方式

```markdown
class类主要分为下面几种方法：
1. <details>
<summary>function1:主要用于xxx</summary>
**因为冲突，这里添加代码块1**
</details>

2. <details>
<summary>function2:主要用于xxx</summary>
**因为冲突，这里添加代码块2**
</details>


3. <details>
<summary>function3:主要用于xxx</summary>
**因为冲突，这里添加代码块3**
</details>

```
渲染如下：

class类主要分为下面几种方法：
1. <details>
<summary>function1: 主要用于xxx</summary>
```python
def function1():
    pass
```
</details>

1. <details>
<summary>function2: 主要用于xxx</summary>
```python
def function2():
    print("hello world")
```
</details>


3. <details>
<summary>function3: 主要用于xxx</summary>
```python
def function3():
    pass
```
</details>



# 其他待补充。。。

