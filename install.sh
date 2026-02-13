#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始安装项目依赖...${NC}\n"

# 安装后端依赖
echo -e "${YELLOW}1. 安装后端依赖...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}后端依赖安装失败${NC}"
  exit 1
fi

cd ..

# 安装前端依赖
echo -e "\n${YELLOW}2. 安装前端依赖...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}前端依赖安装失败${NC}"
  exit 1
fi

cd ..

echo -e "\n${GREEN}✓ 所有依赖安装完成！${NC}"
echo -e "\n请执行以下步骤："
echo -e "1. 配置数据库: cp backend/.env.example backend/.env 并编辑配置"
echo -e "2. 启动后端: cd backend && npm run start:dev"
echo -e "3. 启动前端: cd frontend && npm run dev"
