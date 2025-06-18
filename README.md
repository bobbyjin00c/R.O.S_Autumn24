# 餐厅智能点餐系统 - Restaurant Ordering System

> 基于React+Node.js+PostgreSQL的全栈系统 | 2023年项目

## 系统功能

| 用户角色 | 核心功能 |
|---------|----------|
| **顾客** | 餐桌状态查看、菜单浏览、订单提交、账单查询 |
| **服务员** | 餐桌状态管理、菜品CRUD、订单管理、销售统计 |

##  技术架构
``` mermaid
graph LR
A[React前端] --> B[Node.js/Express]
B --> C[PostgreSQL]
C --> D[Linux/Nginx]
```
##核心实现
###数据库设计

```sql
-- 订单表示例
CREATE TABLE "Order" (
  orderid SERIAL PRIMARY KEY,
  tableid INTEGER REFERENCES "Table"(tableid),
  totalamount NUMERIC(10,2),
  status VARCHAR(20) CHECK(status IN ('pending','completed'))
);
```
### 关键API接口
| 端点 | 方法 |  功能  |
|---------|----------|----------|
| /api/tables| GET |get all table statues|
| /api/dishes| POST| add new dishes|
|/api/orders/:id|PUT|修改订单状态|

### 技术创新点
- ***JWT鉴权***​​：实现角色分级控制（顾客/服务员）
- ***​​实时状态同步***​​​​：前端轮询机制保证数据一致性
- ​​***​​自动化测试***​​​​：使用Jest完成85%单元测试覆盖率

## 快速部署
```bash
# 后端服务
npm install
node app.js

# 前端开发
cd frontend
npm start
```
## 性能指标
|场景	|响应时间|	并发支持|
|---------|----------|----------|
|菜单加载	|120ms|	500+|
|订单提交	|200ms	|300+|

## 贡献者
- ***Bobby Jin*** 前后端开发 数据库管理 运维管理
- ***LeXuan Jiang*** 前后端开发 架构搭建 运维管理
