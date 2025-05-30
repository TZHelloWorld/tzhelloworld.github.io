/**
 * tabs.js | https://theme-next.org/docs/tag-plugins/tabs
 */

/* global hexo */

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