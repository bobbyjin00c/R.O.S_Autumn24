# 餐厅智能点餐系统 - Restaurant Ordering System

> 基于React+Node.js+PostgreSQL的全栈系统 | 2023年项目

## 系统功能

| 用户角色 | 核心功能 |
|---------|----------|
| **顾客** | 餐桌状态查看、菜单浏览、订单提交、账单查询 |
| **服务员** | 餐桌状态管理、菜品CRUD、订单管理、销售统计 |

##  技术架构
```mermaid
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
