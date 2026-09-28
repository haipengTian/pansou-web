# PanSou 前后端单容器部署

该镜像包含：

- 当前仓库 `haipengTian/pansou-web:production` 的网页；
- 后端仓库 `haipengTian/pansou:production` 的 Go 程序；
- Nginx，用于提供网页并把 `/api/*` 和插件管理路由转发给容器内后端。

服务器最终只运行一个名为 `pansou` 的容器。

## 发布镜像

把前端 `develop` 合并到 `production` 并推送。GitHub Actions 会检出你自己的后端 `production`，构建一体镜像：

```text
ghcr.io/haipengtian/pansou-web:production
ghcr.io/haipengtian/pansou-web:latest
ghcr.io/haipengtian/pansou-web:sha-xxxxxxx
```

后端代码更新后，也需要在前端仓库手动运行一次 Actions，或重新推送/更新前端 `production`，才能把新版后端装入一体镜像。

## 替换之前的独立后端

如果已经按 `/opt/pansou/deploy` 启动了独立后端，先停止它。`down` 默认保留缓存卷：

```bash
cd /opt/pansou/deploy
docker compose down
```

确认没有旧容器：

```bash
docker ps -a --filter name=pansou
```

如果存在已停止且同名的旧容器，可删除容器本身（不会删除命名卷）：

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

验证：

```bash
docker compose ps
docker compose logs --tail=100 pansou
curl http://127.0.0.1/api/health
```

网页地址：

```text
http://服务器公网IP/
```

云服务器安全组需开放 TCP 80。登录账号来自 `.env` 的 `AUTH_USERS`。

## 更新与回滚

更新：

```bash
cd /opt/pansou-web
git pull --ff-only origin production
cd deploy
./update.sh
```

回滚时把 `.env` 中的镜像改为之前的 SHA 标签，再执行 `./update.sh`：

```dotenv
PANSOU_IMAGE=ghcr.io/haipengtian/pansou-web:sha-a1b2c3d
```

## 数据

缓存、日志和可持久化插件数据保存在命名卷 `pansou-data`。更新或执行 `docker compose down` 不会删除它。只有执行 `docker compose down -v` 才会删除数据，请谨慎使用。
