#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "错误：缺少 deploy/.env，请先执行：cp .env.example .env" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

docker compose config --quiet
docker compose pull
docker compose up -d --remove-orphans

container_id="$(docker compose ps -q pansou)"
if [ -z "$container_id" ]; then
  echo "错误：一体容器未创建" >&2
  exit 1
fi

printf '等待前后端健康检查'
i=0
while [ "$i" -lt 40 ]; do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")"
  if [ "$status" = "healthy" ]; then
    printf '\n部署完成：前端和后端正在同一个容器中运行。\n'
    docker compose ps
    exit 0
  fi
  if [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
    break
  fi
  printf '.'
  sleep 3
  i=$((i + 1))
done

printf '\n错误：一体容器未通过健康检查，最近日志如下：\n' >&2
docker compose logs --tail=120 pansou >&2
exit 1
