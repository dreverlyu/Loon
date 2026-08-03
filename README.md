# 🪁 Loon Custom Configuration & Plugins

![GitHub last commit](https://img.shields.io/github/last-commit/dreverlyu/Loon?style=flat-square)
![GitHub license](https://img.shields.io/github/license/dreverlyu/Loon?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20macOS-blue?style=flat-square)

> 专注于 **Loon** 客户端的精细化配置仓库，旨在提供简洁易维护的**功能插件（Plugin）**、**分流规则（Rule）**、**重写逻辑**及**自动化任务**。

---

## 🗂 目录结构 | Repository Structure

- **`/Plugin`** —— 插件组合库（去广告、解锁特性、本地注入等模块化插件）
- **`/Rule`** —— 分流规则与远程规则集（Rule-Set）
- **`/Script`** —— 自定义逻辑处理与定时自动化 Task
- **`/Config`** —— 懒人基础配置与基础模块参考

---

## 🧩 核心插件推荐 | Highlight Plugins

> **使用方法：** 复制插件仓库的 Raw 链接，在 Loon 的 `配置 -> 插件 -> 点击右上角 + 号` 填入 URL 即可安装使用。

| 插件名称 (Plugin) | 功能描述 | 链接 (URL) |
| :--- | :--- | :--- |
| **Example Plugin** | 这里简要介绍该插件的作用，如去广告、重定向等 | `https://raw.githubusercontent.com/dreverlyu/Loon/main/Plugin/example.plugin` |

*(注：你可以根据自己仓库里的具体 Plugin 替换表格内容，有一个简洁的表格会极度加分)*

---

## 🚀 进阶调用方式 | Usage

### 1. 订阅分流规则集 (Rule-Set)
在 Loon 配置文件的 `[Remote Rule]` 属性下配置：
```ini
[Remote Rule]
[https://raw.githubusercontent.com/dreverlyu/Loon/main/Rule/example.list](https://raw.githubusercontent.com/dreverlyu/Loon/main/Rule/example.list), policy=SELECT, tag=自定义规则集, enabled=true


2. 引入外部脚本 (Script)
可在对应 Plugin 内部引入，或通过 Loon 配置文件中的 [Script] 部分直接挂载任务。
⚠️ 免责声明 | Disclaimer
	1.	本仓库所有内容仅供测试、学术与个人研究使用，请勿用于非合法用途及商业赢利。
	2.	部分规则与插件结构源自开源技术社区，二次修改均保留对原有版权/原作者的尊重；如有侵权请以 Issue 方式联系删改。
