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
或
> yarn add nodetdx
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
或者
```javascript
// 不传参数时将自动从hosts列表里挑选ping延迟最低的服务器
// 需要注意的是ping延迟最低的服务器更新quote的时间未必是最及时的、最快的
// 也就是说某些ping延迟低的服务器返回的quote可能比一些ping延迟高一点的服务器返回的quote更新的速度还慢
// 这取决于服务器更新quote的速度
// 所以当遇到这样的情况时最好手动指定host和port, 当然这个host和port必然是要经过自己的测试证明quote的更新速度的确是没有问题的
if (await api.connect()) {
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

需要传入 股票代码 + '.' + 市场代码 构成的symbol， 可同时查询多个symbol的行情
```symbol1, symbol2, ..., symbolN```

如：
```javascript
await api.getSecurityQuotes('000001.SZ', '600300.SH')
```

#### 2 : 获取k线

* period-> 
```
周期代码
1m  :  1分钟K线 
5m  :  5分钟K线 
15m :  15分钟K线 
30m :  30分钟K线 
H   :  1小时K线 
D   :  日K线
W   :  周K线
M   :  月K线
Q   :  季K线
Y   :  年K线
```
* symbol -> 证券代码 + '.' + 市场代码;
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
* period-> 
```
周期代码
1m  :  1分钟K线 
5m  :  5分钟K线 
15m :  15分钟K线 
30m :  30分钟K线 
H   :  1小时K线 
D   :  日K线
W   :  周K线
M   :  月K线
Q   :  季K线
Y   :  年K线
```
* symbol -> 证券代码 + '.' + 市场代码;
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
参数：股票代码，时间  如： '600300.SH', 20161209
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


#### 14 : 获取k线(不区分是指数还是股票，会自动根据symbol进行区分)
* period-> 
```
周期代码
1m  :  1分钟K线 
5m  :  5分钟K线 
15m :  15分钟K线 
30m :  30分钟K线 
H   :  1小时K线 
D   :  日K线
W   :  周K线
M   :  月K线
Q   :  季K线
Y   :  年K线
```
* symbol -> 证券代码 + '.' + 市场代码;
* startDatetime -> 指定开始时间;
* endDatetime -> 指定结束时间; (可省，若省略则endDatetime为当前时间)

如： 

```javascript
await api.findBars('D', '000001.SH', '2021-03-02', '2021-03-06')
```


#### 15 : 订阅信息（数据变化推送, 无变化不推送）
* 第一个参数：函数名， 如： 'getSecurityQuotes'
* 最后一个参数：回调函数, 用于接收订阅的数据
* 剩余的参数：需要传递给第一个参数指定的函数需要的参数

**注：在不支持线程的node版本, 该函数会开子进程轮询, 为防止子进程耗尽资源应谨慎使用, 通常用于订阅行情和K线比较合适**

```javascript
api.subscribe('getSecurityQuotes', '600519.SH', callback);
```

#### 16 : 订阅行情（数据变化推送, 无变化不推送）
* 最后一个参数：回调函数, 用于接收订阅的数据
* 剩余的参数：需要订阅的股票symbol
* 若要订阅全市场的股票行情则只需传一个回调函数作为参数

**注：在不支持线程的node版本, 该函数会开子进程轮询, 为防止子进程耗尽资源应谨慎使用, 通常用于订阅行情和K线比较合适**

```javascript
// 订阅'600519.SH', '000001.SH'的行情
api.subscribeQuotes('600519.SH', '000001.SH', callback);
// 订阅全市场股票的行情
api.subscribeQuotes(callback);
```

#### 17 : 查询指定市场所有股票信息列表
* 参数：市场代码
* 若参数为空则查询沪深两市所有股票信息列表

```javascript
// 查询沪市所有股票信息列表
await api.findStockList('SH');
// 查询深市所有股票信息列表
await api.findStockList('SZ');
// 查询沪市、深市所有股票信息列表
await api.findStockList();
```

#### 18 : 读取扩展行情
待完善, 可参考标准行情用法

#### 19 : 解析盘后下载的1分钟K线数据文件(*.lc1)
可参考test/testReader.js
```javascript
const path = require('path');
const { TdxMinuteBarReader } = require('nodetdx');

const reader = new TdxMinuteBarReader();

const result = reader.parseDataFromFile(path.join(__dirname, './sz000001.lc1'));
console.log(JSON.stringify(result));
```

#### 18 : 一些常用代码
市场代码（仅列出已被程序定义和实现的部分代码）：

```
SH       :   上证
SZ       :   深证
DCE      :   大商
CZCE     :   郑商
SHFE     :   上期
CFFEX    :   中金
O@CZCE   :   郑州商品期权
O@DCE    :   大连商品期权
O@SHFE   :   上海商品期权
O@CFFEX  :   中金所期权
O@SH     :   上海股票期权
O@SZ     :   深圳股票期权
MFC      :   主力期货合约
```

---

查询k线支持的时间周期代码：

```
1m  :  1分钟
5m  :  5分钟
15m :  15分钟
30m :  30分钟
H   :  时
D   :  日
W   :  周
M   :  月
Q   :  季
Y   :  年
```

## 版本说明
v3.8.0 支持 `node 8.*.*` 环境, ** 不支持多线程 **
v4.0.0 支持 `node 10` 以上环境, ** 支持多线程 **
## 其它
本项目fork自[https://github.com/rainx/pytdx](https://github.com/rainx/pytdx)，在pytdx基础上修改而来，并修复了一些bug

在此感谢pytdx的作者[RainX](https://github.com/rainx)
