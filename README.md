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
const { TdxMarketApi } = require('nodetdx')
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
await api.getSecurityQuotes('000001.SZ', '600300.SH')
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
await api.getSecurityBars('D', '000001.SZ', 0, 100)
```

#### 3 : 获取市场股票数量
'SZ' - 深圳， 'SH' - 上海
```javascript
await api.getSecurityCount('SH')
```
#### 4 : 获取股票列表
参数：市场代码, 起始位置， 数量  如： 'SH',0 或 'SH',100

```javascript
await api.getSecurityList('SH', 0)
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
await api.getIndexBars('D', '000001.SH', 1, 2)
```
#### 6 : 查询分时行情
参数：股票代码， 如： '000001.SZ' 或 '600300.SH'
```javascript
await api.getMinuteTimeData('600300.SH')
```
#### 7 : 查询历史分时行情
参数：股票代码，时间 如： '600300.SH', 20161209
```javascript
await api.getHistoryMinuteTimeData('600300.SH', 20161209)
```

#### 8 : 查询分笔成交

参数：股票代码，起始位置， 数量 如： 000001.SZ
```javascript
await api.getTransactionData('000001.SZ', 0, 30)
```

#### 9 : 查询历史分笔成交

参数：股票代码，起始位置，日期 数量 如： '000001.SZ',0,10,20170209

```javascript
await api.getHistoryTransactionData('000001.SZ', 0, 10, 20170209)
```
#### 10 : 查询公司信息目录
参数：股票代码， 如： '000001.SZ'
```javascript
await api.getCompanyInfoCategory('000001.SZ')
```

#### 11 : 读取公司信息详情

参数：股票代码, 文件名, 起始位置， 数量, 如：'000001.SZ','000001.txt',2054363,9221
```javascript
await api.getCompanyInfoContent('000001.SZ', '000001.txt', 0, 10000)
```

注意这里的 起始位置， 数量 参考上面接口的返回结果。

#### 12 : 读取除权除息信息
参数：股票代码， 如： '600300.SH'
```javascript
await api.getExRightInfo('600300.SH')
```

#### 13 : 读取财务信息
参数：股票代码， 如： '000001.SZ'
```javascript
await api.getFinanceInfo('000001.SZ')
```

#### 14 : 读取扩展行情
待完善, 可参考标准行情用法

### 一些常用代码
市场代码（仅列出已被程序定义和实现的部分代码）：
---
```
SH: 上证
SZ: 深证
DCE: 大商
CZCE: 郑商
SHFE: 上期
CFFEX: 中金
O@CZCE: 郑州商品期权
O@DCE: 大连商品期权
O@SHFE: 上海商品期权
O@CFFEX: 中金所期权
O@SH: 上海股票期权
O@SZ: 深圳股票期权
MFC: 主力期货合约
```


查询k线支持的时间周期：
---
```
1m: 1分钟
5m: 5分钟
15m: 15分钟
30m: 30分钟
H: 时
D: 日
W: 周
M: 月
Q: 季
Y: 年
```

## 其它
本项目fork自[https://github.com/rainx/pytdx](https://github.com/rainx/pytdx)，在pytdx基础上修改而来，并修复了一些bug

在此感谢pytdx的作者[RainX](https://github.com/rainx)
