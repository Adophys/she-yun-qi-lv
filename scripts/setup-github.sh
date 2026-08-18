#!/usr/bin/env bash
# setup-github.sh — 一键创建 GitHub 仓库、推送代码、邀请协作者
# 使用前请先运行: gh auth login
set -euo pipefail

REPO_NAME="she-yun-qi-lv"
COLLABORATORS=("web-demo-lab" "mute-sheep")

echo "=== 畲韵奇旅 GitHub 仓库初始化 ==="
echo ""

# 1. 检查 gh 是否已登录
if ! gh auth status &>/dev/null; then
  echo "ERROR: 未登录 GitHub CLI，请先运行: gh auth login"
  exit 1
fi

# 2. 获取当前 GitHub 用户名
GH_USER=$(gh api user --jq .login)
echo "当前 GitHub 用户: $GH_USER"
echo "仓库名: $REPO_NAME"
echo "协作者: ${COLLABORATORS[*]}"
echo ""

read -p "确认创建仓库并推送? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "已取消"
  exit 0
fi

echo ""
echo "--- 1/4 创建远程仓库 ---"
gh repo create "$REPO_NAME" \
  --public \
  --description "畲韵奇旅 - 基于微信小程序的畲族文化数字化体验与科普平台（大学生创新创业大赛）" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "--- 2/4 确认分支名 ---"
git branch -M main

echo ""
echo "--- 3/4 邀请协作者 ---"
for username in "${COLLABORATORS[@]}"; do
  echo "  邀请 @$username ..."
  gh api \
    --method PUT \
    "/repos/$GH_USER/$REPO_NAME/collaborators/$username" \
    -f permission=push 2>/dev/null && echo "  ✓ 已邀请 @$username" || echo "  ⚠ 邀请 @$username 失败（可能已邀请或用户名有误）"
done

echo ""
echo "--- 4/4 完成 ---"
echo ""
echo "仓库地址: https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "下一步:"
echo "  1. 通知协作者查收邮件接受邀请"
echo "  2. 协作者 clone 仓库: git clone https://github.com/$GH_USER/$REPO_NAME.git"
echo "  3. 创建 develop 分支: git checkout -b develop && git push -u origin develop"
echo ""
