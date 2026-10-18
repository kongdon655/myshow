---
title: "任务看板应用"
description: "支持拖拽排序的看板应用，用于个人任务与项目进度管理。"
cover: "📋"
tags: ["React", "Node.js", "PostgreSQL"]
repo: "https://github.com"
featured: false
date: "2026-08-20"
---

## 项目简介

一个支持拖拽排序的任务看板，提供看板、列表、卡片三级结构。

## 核心特性

- 拖拽排序与跨列表移动
- 实时协作编辑
- 数据持久化到 PostgreSQL

## 技术栈

React、Node.js、PostgreSQL、WebSocket。

## 难点

拖拽的乐观更新与并发冲突处理是最有挑战的部分，最终通过版本号乐观锁解决。
