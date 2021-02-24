# nodetdx 通达信数据接口
========

概述
----
使用纯nodejs类似TradeX的获取通达信行情接口的实现
 
 声明
---
此代码用于个人对网络协议的研究和习作，不对外提供服务，任何人使用本代码遇到问题请自行解决，也可以在github提issue给我，但是我不保证能即时处理。
由于我们连接的是既有的通达信兼容行情服务器，机构请不要使用此代码，对此造成的任何问题本人概不负责。


安装
---

```bash
> npm install nodetdx
```


### 服务器

目前可用服务器
--------------------
[1] :招商证券深圳行情 (119.147.212.81:7709)

[2] :上海双线主站 (101.133.214.242:7709)

--------------------
功能列表：

1 : 获取股票行情

2 : 获取k线

3 : 获取市场股票数量

4 : 获取股票列表

5 : 获取指数k线

6 : 查询分时行情

7 : 查询历史分时行情

8 : 查询分笔成交

9 : 查询历史分笔成交

10 : 查询公司信息目录

11 : 读取公司信息详情

12 : 读取除权除息信息

13 : 读取财务信息


接口API
---
下面是如何在程序里面调用本接口(这里行情数据的接口都是promise接口)

首先需要引入

```javascript
const { TdxMarketApi, MARKET_SH, MARKET_SZ } = require('nodetdx')
```

然后，创建对象

```javascript
const api = new TdxMarketApi()
```

之后，通常是如下的格式

```javascript
if (await api.connect('119.147.212.81', 7709)) {
    // ... same codes...
    api.disconnect()
}
```

可以使用的api方法有下列的几个。

### api方法列表

#### 参数一般性约定

一般来说，股票代码和文件名称使用字符串类型，其它参数都使用数值类型


#### 1 : 获取股票行情
可以获取**多**只股票的行情信息

需要传入一个列表，每个列表由一个市场代码， 一个股票代码构成的元祖构成
```[ [市场代码1， 股票代码1]，[市场代码2， 股票代码2] ... [市场代码n， 股票代码n] ]```

如：
```javascript
await api.getSecurityQuotes([[0, '000001'], [1, '600300']])
```

#### 2 : 获取k线

* category-> 
```
K线种类
0 5分钟K线 
1 15分钟K线 
2 30分钟K线 
3 1小时K线 
4 日K线
5 周K线
6 月K线
7 1分钟
8 1分钟K线 
9 日K线
10 季K线
11 年K线
```
* market -> 市场代码 0:深圳，1:上海
* stockcode -> 证券代码;
* start -> 指定的范围开始位置;
* count -> 用户要请求的 K 线数目，最大值为 800

如： 

```javascript
await api.getSecurityBars(9, 0, '000001', 0, 100)
```

#### 3 : 获取市场股票数量
0 - 深圳， 1 - 上海
```javascript
await api.getSecurityCount(0)
```
#### 4 : 获取股票列表
参数：市场代码, 起始位置， 数量  如： 0,0 或 1,100

```javascript
await api.getSecurityList(1, 0)
```

#### 5 : 获取指数k线
* category-> 
```
K线种类
0 5分钟K线 
1 15分钟K线 
2 30分钟K线 
3 1小时K线 
4 日K线
5 周K线
6 月K线
7 1分钟
8 1分钟K线 
9 日K线
10 季K线
11 年K线
```
* market -> 市场代码 0:深圳，1:上海
* stockcode -> 证券代码;
* start -> 指定的范围开始位置;
* count -> 用户要请求的 K 线数目，最大值为 800

如： 

```javascript
await api.getIndexBars(9,1, '000001', 1, 2)
```
#### 6 : 查询分时行情
参数：市场代码， 股票代码， 如： 0,000001 或 1,600300
```javascript
await api.getMinuteTimeData(1, '600300')
```
#### 7 : 查询历史分时行情
参数：市场代码， 股票代码，时间 如： 0,000001,20161209 或 1,600300,20161209
```javascript
await api.getHistoryMinuteTimeData(MARKET_SH, '600300', 20161209)
```

注意，我们可以使用 MARKET_SH , MARKET_SZ 常量来代替 1 和 0 作为参数

#### 8 : 查询分笔成交

参数：市场代码， 股票代码，起始位置， 数量 如： 0,000001,0,10
```javascript
await api.getTransactionData(MARKET_SZ, '000001', 0, 30)
```

#### 9 : 查询历史分笔成交

参数：市场代码， 股票代码，起始位置，日期 数量 如： 0,000001,0,10,20170209

```javascript
await api.getHistoryTransactionData(MARKET_SZ, '000001', 0, 10, 20170209)
```
#### 10 : 查询公司信息目录
参数：市场代码， 股票代码， 如： 0,000001 或 1,600300
```javascript
await api.getCompanyInfoCategory(MARKET_SZ, '000001')
```

#### 11 : 读取公司信息详情

参数：市场代码， 股票代码, 文件名, 起始位置， 数量, 如：0,000001,000001.txt,2054363,9221
```javascript
await api.getCompanyInfoContent(0, '000001', '000001.txt', 0, 10000)
```

注意这里的 起始位置， 数量 参考上面接口的返回结果。

#### 12 : 读取除权除息信息
参数：市场代码， 股票代码， 如： 0,000001 或 1,600300
```javascript
await api.getExRightInfo(1, '600300')
```

#### 13 : 读取财务信息
参数：市场代码， 股票代码， 如： 0,000001 或 1,600300
```javascript
await api.getFinanceInfo(0, '000001')
```

#### 14 : 读取扩展行情
待完善, 可参考标准行情用法

## 其它

本项目fork自[https://github.com/rainx/pytdx](https://github.com/rainx/pytdx)，在pytdx基础上修改而来，并修复了一些bug

在此感谢pytdx的作者[RainX](https://github.com/rainx)
