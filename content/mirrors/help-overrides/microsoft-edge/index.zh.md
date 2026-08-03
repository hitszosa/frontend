### 使用 apt 下载 Microsoft Edge

添加镜像源：

```{ztmpl lang="bash"}
{{sudo}}add-apt-repository "deb [arch=amd64] {{http_protocol}}{{mirror}} stable main"
```

安装 Microsoft Edge，通常使用稳定版软件包：

```{ztmpl lang="bash"}
{{sudo}}apt update
{{sudo}}apt install microsoft-edge-stable
```
