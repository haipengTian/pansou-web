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
AUTH_USERS=admin:你的强密码
AUTH_JWT_SECRET=上一步生成的随机字符串
```

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

缓存、日志和可持久化插件数据保存在命名卷 `pansou-data`。更新或执行 `docker compose down` 不会删除它。只有执行 `docker compose down -v` 才会删除数据，请谨慎使用。
