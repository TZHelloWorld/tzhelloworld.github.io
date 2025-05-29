---
title: hexo个性化之选项卡功能添加
excerpt: '在使用 hexo fluid 主题时候发现没有切换选项卡的功能，因此我基于其他主题的源码，自己修改了一个，特此记录一下'
index_img: /img/post/hexo.jpg
category_bar: ["博客"]
categories: 
  - 技术栈
  - 博客
tags:
  - Hexo
date: 2025-05-26 20:38:43
updated:
sticky:
---

# 功能演示
在 `markdown` 中使用如下：

```markdown
# 默认选择第2个
{% tabs Name, 2 %}

<!-- tab first Tab-->
 tab 1 content
<!-- endtab -->


<!-- tab Second Tab-->
 tab 2 content
<!-- endtab -->


<!-- tab Third Tab-->
 tab 3 content
<!-- endtab -->

{% endtabs %}
```

最终渲染的内容如下：

{% tabs Name, 2 %}

<!-- tab first Tab-->
 tab 1 content
<!-- endtab -->


<!-- tab Second Tab-->
 tab 2 content
<!-- endtab -->


<!-- tab Third Tab-->
 tab 3 content
<!-- endtab -->

{% endtabs %}


# 实现过程

首先需要了解下，对于渲染的原理：`hexo` 将 `markdown` 中的语法标签转换成对应的 `html` 结构, 然后为转换成的 `html` 内容添加样式和动画，所以实现的时候需要：
1. markdown中标签解析，并生成对一个的选项卡HTML的结构
2. javascript关于生成的选项卡的点击切换逻辑
3. css样式美化操作

## 将对应的标签转换成html结构

追踪hexo代码，其实现逻辑主要在 `/themes/fluid/scripts/tags` 目录下，在这个目录下创建一个`tabs.js` 的文件，并添加内容：
```js
'use strict';

function postTabs(args, content) {
  var tabBlock = /<!--\s*tab (.*?)\s*-->\n([\w\W\s\S]*?)<!--\s*endtab\s*-->/g;

  args = args.join(' ').split(',');
  var tabName = args[0];
  var tabActive = Number(args[1]) || 0;

  var matches = [];
  var match;
  var tabId = 0;
  var tabNav = '';
  var tabContent = '';

  !tabName && hexo.log.warn('Tabs block must have unique name!');

  while ((match = tabBlock.exec(content)) !== null) {
    matches.push(match[1]);
    matches.push(match[2]);
  }

  for (var i = 0; i < matches.length; i += 2) {
    var tabParameters = matches[i].split('@');
    var postContent   = matches[i + 1];
    var tabCaption    = tabParameters[0] || '';
    var tabIcon       = tabParameters[1] || '';
    var tabHref       = '';

    postContent = hexo.render.renderSync({text: postContent, engine: 'markdown'}).trim();

    tabId += 1;
    tabHref = (tabName + ' ' + tabId).toLowerCase().split(' ').join('-');

    ((tabCaption.length === 0) && (tabIcon.length === 0)) && (tabCaption = tabName + ' ' + tabId);

    var isOnlyicon = tabIcon.length > 0 && tabCaption.length === 0 ? ' style="text-align: center;"' : '';
    
    let icon = tabIcon.trim();
    icon = icon.startsWith('fa') ? icon : 'fa fa-' + icon;
    tabIcon.length > 0 && (tabIcon = `<i class="${icon}"${isOnlyicon}></i>`);

    var isActive = (tabActive > 0 && tabActive === tabId) || (tabActive === 0 && tabId === 1) ? ' active' : '';
    tabNav += `<li class="tab${isActive}"><button type="button" data-href="#${tabHref}">${tabIcon + tabCaption.trim()}</button></li>`;

    tabContent += `<div class="tab-pane${isActive}" id="${tabHref}">${postContent}</div>`;
  }

  tabNav = `<ul class="nav-tabs">${tabNav}</ul>`;
  tabContent = `<div class="tab-content">${tabContent}</div>`;

  return `<div class="tabs" id="${tabName.toLowerCase().split(' ').join('-')}">${tabNav + tabContent}</div>`;
}

hexo.extend.tag.register('tabs', postTabs, {ends: true});
hexo.extend.tag.register('subtabs', postTabs, {ends: true});
hexo.extend.tag.register('subsubtabs', postTabs, {ends: true});
```

该代码的作用就是扫描`markdown`文件中所有关于`tabs`的标签，并将其转换成对应的`HTML`块结构

## javascript关于生成的选项卡的点击切换逻辑

这个主要是为了将生成的html块添加切换功能，是需要生成对应的静态文件的，所以编写在 `/themes/fluid/source/js/` 目录下, 在这个目录下创建 `tabs.js` 用于添加切换功能逻辑代码，内容如下：

```js
  const siblings = (ele, selector) => {
    return [...ele.parentNode.children].filter((child) => {
      if (selector) {
        return child !== ele && child.matches(selector)
      }
      return child !== ele
    })
  }

  const tabsFn = {
    clickFnOfTabs: function () {
      document.querySelectorAll(' .tab > button').forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this // 当前按钮的父级 <li>
          const $tabItem = $this.parentNode  // 导航栏 <ul>

          if (!$tabItem.classList.contains('active')) {

            const $tabContent = $tabItem.parentNode.nextElementSibling
            
            // 移除所有兄弟按钮的 active 类
            const $siblings = siblings($tabItem, '.active')[0]
            $siblings && $siblings.classList.remove('active')

            // 当前按钮添加 active 类
            $tabItem.classList.add('active')

            const tabId = $this.getAttribute('data-href').replace('#', '')
            const childList = [...$tabContent.children]
            
            childList.forEach(item => {
              if (item.id === tabId) item.classList.add('active')
              else item.classList.remove('active')
            })
          }
        })
      })
    }

}
tabsFn.clickFnOfTabs()
```

之后需要告诉 `fluid` 添加自定义的 `js` 代码，即在 `_config.fluid.yml` 文件中找到自定义 `custom_js` 选项，将 `/js/tabs.js`添加:

```yaml
custom_js:
  - /js/tabs.js
```


## css样式美化操作

之后就需要对生成的 `HTML` 颜色样式进行编写代码，同理，这个是给生成静态文件的样式，所以写在 `/themes/fluid/source/css/` 目录下, 在这个目录下创建 `tabs.css` 用于添加切换功能逻辑代码，内容如下：

```css
/* 主色调：低饱和橙黄 + 米白基底 */
:root {
  --nav-tabs-bg: #fff3e0;     /* 米白背景 */
  --primary: #ffecb3;         /* 淡橙黄激活选项卡 */
  --secondary: #f7f9ee;       /* 浅青灰辅助色 */
  
  /* 辅助色：冷灰与柔和蓝绿 */  
  --content-bg: #ffffff;      /* 纯白内容区 */
  --border: #e9f5dc;          /* 浅黄绿边框 */
  --activate-border: #a8e9ed; /* 海沫绿选中边框 */
  
  /* 文字色：深绿与中性灰 */  
  --text: #6c757d;            /* 中性灰蓝文字 */
  --active-text: #2e647a;     /* 深森林绿选中） */
  
  /* 投影与反馈：极淡透明色 */  
  --primary-shadow: rgba(255, 127, 80, 0.2); /* 半透明琥珀橙阴影 */
  --shadow: rgba(0,0,0,0.2); /* 极淡投影 */
  --tab-button-hover: #f6e4c6; /* 浅鲑鱼橙悬停反馈 */
}

/* 容器基础样式 */
.tabs {
  max-width: 96%;
  margin: 10px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px var(--shadow);
}

/* 导航栏布局优化 */
.nav-tabs {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--nav-tabs-bg);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 6px var(--shadow);
}

/* 移除列表项默认间距 */
.tabs > ul{
  padding: 0;
  margin: 0;
}

/* 使用间隙替代边框分隔 */
.tabs > ul > li {
  margin: 0;
  padding: 0;
}

/* 按钮样式统一 */
.tab {
  flex-shrink: 0;
  padding: 0 8px; /* 统一外边距 */
}

.tab > button {
  position: relative;
  padding: 8px 16px;
  background: var(--secondary);
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  transition: all 0.3s ease;
  border-radius: 12px 12px 0 0;
  border-right: 2px solid var(--border);
  border-left: 2px solid var(--border);
  border-top: 2px solid var(--border);
}


/* 优化悬停效果 */
.tab > button:hover {
  background: var(--tab-button-hover);
}

/* 激活状态样式 */
.tab.active > button  {
  /* background: var(--content-bg); */
  background: var(--primary);
  /* color: , 字体颜色 */
  color: var(--active-text); 
  border-right: 2px solid var(--activate-border);
  border-left: 2px solid var(--activate-border);
  border-top: 2px solid var(--activate-border);
  box-shadow: inset 0 -3px 0  var(--primary-shadow);
}

.tab > button.active:hover {
  background-position: left bottom;
}

/* 内容显示控制 */
.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

/* 内容区域样式 */
.tab-content {
  padding: 10px;
  background: var(--content-bg);
  border-top: 1px solid var(--border);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
```

同理，在 `_config.fluid.yml` 文件中找到自定义 `custom_css` 选项，将 `/css/tabs.css`添加:

```yaml
custom_css:
  - /css/tabs.css
```

{% note warn %}
其实这个不算完整，因为 `hexo` 有主题切换功能，即 `light` 和 `dark` 主题切换操作。我这个实现都用了同一套颜色，肯定是有问题的。其实切换实现原理也简单，只需要将上述中 `:root` 颜色配置写到 `themes\fluid\source\css\_pages\_base\color-schema.styl` 中, 并分别配置两套不同的颜色组合，然后再在 `/themes/fluid/source/css/tabs.css` 中使用即可。
{% endnote %}

