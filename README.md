# For Xiaobai bao

一个复古胶片风格的双次抽签页面：从三份秘密中选出两份，真实礼物内容不会出现在公开网页中。

## 本地预览

在 PowerShell 中进入本项目目录，然后运行：

```powershell
npm install
npm run dev
```

打开命令行显示的本地网址即可。

## 私密信息

真实礼物与抽签代号的对应关系保存在本地的 `PRIVATE-GIFT-MAP.md`。这个文件已经写入 `.gitignore`，正常执行 `git add .` 时不会上传到 GitHub。

正式分享前，可以在页面网址后加上 `?reset=xbbao`，打开一次即可清除当前设备的测试结果。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个空仓库，不要勾选自动创建 README、License 或 `.gitignore`。
2. 在本项目目录中提交并推送：

```powershell
git add .
git commit -m "Create Xiaobai bao private screening"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

3. 打开仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 中，把 `Source` 选择为 `GitHub Actions`。
5. 打开仓库的 `Actions` 页面，等待 `Deploy to GitHub Pages` 变为绿色。
6. 页面地址通常为：

```text
https://你的用户名.github.io/你的仓库名/
```

以后每次把新修改推送到 `main` 分支，网站都会自动更新。
