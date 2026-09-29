# PanSou 前后端单容器部署

该镜像包含：

- 当前仓库 `haipengTian/pansou-web:production` 的网页；
- 后端仓库 `haipengTian/pansou:production` 的 Go 程序；
- 容器内 Nginx，用于提供网页并把 `/api/*` 和插件管理路由转发给后端。

服务器只运行一个名为 `pansou` 的应用容器。容器绑定 `127.0.0.1:9000`，不占用宿主机的 80/443；服务器已有的 Nginx 继续监听公网 80/443，并按域名把 `sou.thpvip.xyz` 转发到该容器。

## 发布镜像

把前端 `develop` 合并到 `production` 并推送。GitHub Actions 会检出你自己的后端 `production`，构建一体镜像：

```text
ghcr.io/haipengtian/pansou-web:production
ghcr.io/haipengtian/pansou-web:latest
ghcr.io/haipengtian/pansou-web:sha-xxxxxxx
```

后端代码更新后，也需要在前端仓库手动运行一次 Actions，或重新推送前端 `production`，才能把新版后端装入一体镜像。

## 替换之前的独立后端

如果已经按 `/opt/pansou/deploy` 启动了独立后端，先停止它。`down` 默认保留缓存卷：

```bash
cd /opt/pansou/deploy
docker compose down
```

如果仍存在已停止且同名的旧容器，删除容器本身（不会删除命名卷）：

```bash
docker rm pansou
```

## 首次部署一体容器

```bash
git clone --branch production https://github.com/haipengTian/pansou-web.git /opt/pansou-web
cd /opt/pansou-web/deploy
cp .env.example .env
openssl rand -hex 32
```

编辑 `.env`，至少设置：

```dotenv
ADMIN_USERS=admin:你的强密码
AUTH_JWT_SECRET=上一步生成的随机字符串
```

`ADMIN_USERS` 是管理后台的管理员；客户账号在后台「用户管理」中创建。

启动：

```bash
chmod 600 .env
chmod +x update.sh
./update.sh
```

验证容器：

```bash
docker compose ps
docker compose logs --tail=100 pansou
curl http://127.0.0.1:9000/api/health
```

## 配置 sou.thpvip.xyz HTTPS

先确认域名的 A/AAAA 记录已经指向这台服务器。宿主机已有 Nginx 时，不需要也不能让容器绑定 80/443；多个域名可以由同一个 Nginx 通过 `server_name` 共用这两个端口。

复制配置模板。不同系统的 Nginx 配置目录可能不同：

```bash
# RHEL/CentOS/Rocky/AlmaLinux 常用目录
cp /opt/pansou-web/deploy/nginx-sou.thpvip.xyz.conf /etc/nginx/conf.d/sou.thpvip.xyz.conf

# Debian/Ubuntu 也可放入 sites-available 并建立 sites-enabled 软链接
```

模板默认使用 Certbot 证书路径：

```text
/etc/letsencrypt/live/sou.thpvip.xyz/fullchain.pem
/etc/letsencrypt/live/sou.thpvip.xyz/privkey.pem
```

如果现有证书不包含该域名，需要先签发。为了避免 Nginx 在证书不存在时无法加载，可先使用 Certbot 的 Nginx 插件自动创建/修改配置：

```bash
certbot --nginx -d sou.thpvip.xyz
```

如果证书已经存在，或者签发后使用仓库模板：

```bash
nginx -t
systemctl reload nginx
curl -I https://sou.thpvip.xyz/
```

最终网页地址：

```text
https://sou.thpvip.xyz/
```

云安全组需开放 TCP 80、443。80 只负责证书验证与跳转，网页实际走 443；不需要开放 9000，因为它仅监听 `127.0.0.1`。

## 管理后台

浏览器打开 `https://sou.thpvip.xyz/admin`，用 `ADMIN_USERS` 中的账号登录。后台可以：

- **插件管理 / 频道与网盘类型**：修改后立即生效，无需重启；保存在数据卷的 `settings.json`。
- **用户管理**：创建客户账号，禁用、改角色或重置密码（对应账号的旧登录会立即失效）。
- **数据源账号**：qqpd、gying、panlian、weibo、woniu 等插件的账号配置，只有管理员可访问。
- **概览 / 运行参数 / API 文档**：原先对所有访客可见，现在只在后台显示。

客户访问 `https://sou.thpvip.xyz/` 登录后只能搜索，并在「筛选」页中勾选后台放开的频道、插件和网盘类型；
请求中超出范围的参数会被服务端剔除。公开的 `/api/health` 只返回存活状态。

`CHANNELS` 与 `ENABLED_PLUGINS` 只在第一次启动时写入 `settings.json`，之后请在后台修改。
如需按环境变量重新生成，删除卷内的 `/app/data/admin/settings.json`（一体镜像）后重启容器。

## 从未含管理后台的版本升级

1. 在 `deploy/.env` 中新增 `ADMIN_USERS=管理员名:强密码`（否则 `./update.sh` 会在校验阶段报错，旧容器保持运行不受影响）。
2. 原 `AUTH_USERS` 中的账号继续可用，身份为普通用户；也可以清空它，改在后台创建客户账号。
3. 执行 `./update.sh`。首次启动会用当前的 `CHANNELS`、`ENABLED_PLUGINS` 生成后台设置，行为与升级前一致。

## 更新与回滚

更新：

```bash
cd /opt/pansou-web
git pull --ff-only origin production
cd deploy
./update.sh
```

回滚时把 `.env` 中镜像改为之前的 SHA 标签，再执行 `./update.sh`：

```dotenv
PANSOU_IMAGE=ghcr.io/haipengtian/pansou-web:sha-a1b2c3d
```

## 数据

缓存、日志、可持久化插件数据以及后台的设置与账号（`/app/data/admin/`）保存在命名卷 `pansou-data`。更新或执行 `docker compose down` 不会删除它。只有执行 `docker compose down -v` 才会删除数据，请谨慎使用。
