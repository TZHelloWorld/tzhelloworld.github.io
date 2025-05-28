# 使用

在一个新环境中需要编写博客，需要(使用ssh登录，需要配置下)：

```bash
git clone git@github.com:TZHelloWorld/tzhelloworld.github.io.git
cd tzhelloworld

npm install hexo
npm install hexo-deployer-git -save
```

环境配置完成后，使用 `hexo d` 将生成的静态文件同步到`GitHub`上，使用 `git push` 将源文件同步到`GitHub`上

```bash
hexo d

git push origin source
```