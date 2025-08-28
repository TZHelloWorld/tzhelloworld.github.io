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
            
            // // 将对应的tabId设置为样式
            // const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId}`)
            // if ($isTabJustifiedGallery.length > 0) {
            //   console.log( $isTabJustifiedGallery + tabId)
            //   console.log($siblings)
            //   btf.initJustifiedGallery($isTabJustifiedGallery)
            // }
          }
        })
      })
    }
    // backToTop: () => {
    //   document.querySelectorAll(' .tabs .tab-to-top').forEach(function (item) {
    //     item.addEventListener('click', function () {
    //       btf.scrollToDest(btf.getEleTop(btf.getParents(this, '.tabs')), 300)
    //     })
    //   })
    // }
}
tabsFn.clickFnOfTabs()
// tabsFn.backToTop()
