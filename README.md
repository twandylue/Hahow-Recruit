# Assessment-hahow

Assessment project for HaHow recruit

# Contents

- [API Endpoints](#api-endpoints)
- [Concepts](#concepts)
- [如何跑起來](#如何跑起來)
- [Coding Style](#Coding-Style)
- [關於測試](#關於測試)
- [Issues](#Issues)


## Start Server

### Preparation
make sure to add **.env** file
ex:
```
NODE_ENV = 'production'
PORT = 3000
RATE_LIMIT_WINDOW = 1
RATE_LIMIT_COUNT = 10
cacheMode='on'
hahowServerHost = 'https://hahow-recruit.herokuapp.com'
hahowServerHeroesPath = 'heroes'
hahowServerAuthPath = 'auth'
retryLimit = 3
REDIS_HOST='redis' 
```
### Local start
1. **modify docker-compose.yaml**: 
comment out below code  
`- ./ssl/coolhahow.xyz.crt:/etc/nginx/ssl/ssl.csr`
`- ./ssl/coolhahow.xyz.key:/etc/nginx/ssl/ssl.key`
`- 443:443`
2. **modify nginx/node.conf**:  
ex:
```
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_tokens off;

  location / {
  proxy_pass http://node:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Fowarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Fowarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```
3. **Run docker-compose.yaml**:
Remember start docker first.  
`docker-compose up -d`

4. **Now you can call local api**:   
http://localhost/heroes  
http://localhost/heroes/:heroId


# Concepts

本專案使用 node.js 搭配 `express` 進行 API 服務, service process 透過 `pm2` 進行管理.

log 部分則使用 `pino` 套件達到 log level 管理, 以利在 (需要) production 環境時可以關閉非必要與 debug logs.

文件的部分, 則透過 `apidoc` 進行 API 文件的生成.

- [apidoc 說明文件](https://assessment.roycrxtw.uk/apidoc)

## test

使用 jest 框架搭配 sinon 做 unit test. 詳見 [關於測試](#關於測試).


## 系統架構圖

系統架構在個人的 AWS EC2 instance 上, 透過不同的 container 去服務不同的 API services.

在 app server 前面尚有一台架在 ec2 上的 nginx 作為 reverse proxy 以及提供 TLS 連線的功能.

![infra](static/chart-infra.png)

## 部署流程

![infra](static/chart-cicd.png)


# 如何跑起來

若有安裝 docker 以及 docker-compose:

```bash
git clone https://github.com/Tsai-Hsueh-Kuan/Hahow-Recruit.git
cd Hahow-Recruit
docker-compose up -d

# container 跑起來後:

echo '嘗試取得 service about 資訊'
curl -X GET http://localhost:3000/
# response: {"msg":"Hahow Assessment Project by roycrxtw"}

echo '嘗試取得英雄列表'
curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/heroes
# response: a hero list
```

若要直接執行, 不使用 docker and docker-compose:

```bash
git clone https://github.com/roycrxtw/assessment-hahow.git
cd Hahow-Recruit
npm i -g pm2
npm install -y
pm2 start app.js

# pm2 跑起來後:

echo '嘗試取得 service about 資訊'
curl -X GET http://localhost:3000/
# response: {"msg":"Hahow Assessment Project by roycrxtw"}

echo '嘗試取得英雄列表'
curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/heroes
# response: a hero list
```

# Coding Style

專案透過 eslint 之輔助, 並設定 airbnb style 來協助 coding style 之一致.

其中有部分 eslint rule 有做客製化設定, 設定可於下列路徑查詢
```bash
<project-root>/.eslintrc.js
```

# 關於測試



## Unit-test



## API test


## 如何執行測試

# Issues

## 遠端 API 模擬不穩定狀態

實作拿取資料時會發現hahowAPI其中幾隻回應有模擬錯誤(statusCode=200但資料不正確),
假定API server不穩定,經由 artillery.io 測試發現錯誤率約略在1/3,
故在API設計retry機制,系統可以直接重新嘗試取得符合規範的 response,
retry次數限制可透過 **.env** 設定

> 目前 retry 設定為 3.

### Why retry?

這邊採用 retry 而非 cache 的想法是希望 API 呈現的結果是直接反映出遠端即時的資料狀態, 例如英雄已經升級為 str 100, 使用者可能希望立刻看到他的結果.
而非快取住的稍微過時的資料. 另外可能這資料再次被讀取的機會很低, cache 的效益就會遞減許多.

但使用 retry 的結果缺點是 API 在回應上會慢了不少, 且可能在 retry 耗盡後依舊無法取得正確結果.

若需求上允許資料稍微不那麼即時的話, 或許採用 cache 機制是一個較佳的方案, 可以有效地提升 API 回應速度.

### Return null or throw error?

`什麼時候會丟出錯誤` 當呼叫遠端 API 時耗盡重試次數, 算是 `服務` 上出了問題, 故是回傳 error.

`什麼時候回傳 null or []` 404 找不到資料時, 在專案中不視為錯誤, 故如果沒有找到結果時會是回傳 [] or null.

另外, 資料檢驗上使用較嚴格的方式確認, 當資料不符合規範時則直接拋棄該資料.


## Axios

過去都是使用 request 套件做 http 請求為主, 但因為該套件已經被標註為 `@deprecated`, 故利用此機會選用另一個使用率亦非常高的套件 `axios`.

### 選用新套件的原則

通常如果有數個功能都很接近的套件需要選擇時, 我會去觀察該套件的下載率, 協作者數目, github 上的 open issue, 專案最後 commit 時間為何以及是否 pass test, 
透過這幾個因素去判斷套件是否合用, 避免套件有問題但其實沒人在維護, 或是社群不活躍有問題很難取得協助.

若有需要時還必須檢驗套件的 license 是否可以使用在商用專案上.

> 所以經過比較後決定嘗試使用 axios.

### Axios 的特別處

這個套件比較特別的是非 200~300 系列的 response 會直接變成錯誤, 故需要特別設定 validateStatus option 去排除 404 類型的回應.

> 想法是 404 找不到資料不代表是一種錯誤, e.g. 搜尋某個關鍵字沒有任何商品不代表有東西壞了, 也不需要去 retry.

## API Documentation
### List Heroes [GET] /heroes
* Request
```
curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET https://coolhahow.xyz/heroes
```

* Success case:
`Response 200`
```json=
{
    "heroes": [
        {
            "id": "1",
            "name": "Daredevil",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg"
        },
        {
            "id": "2",
            "name": "Thor",
            "image": "http://x.annihil.us/u/prod/marvel/i/mg/5/a0/537bc7036ab02/standard_xlarge.jpg"
        },
        {
            "id": "3",
            "name": "Iron Man",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/a0/55b6a25e654e6/standard_xlarge.jpg"
        },
        {
            "id": "4",
            "name": "Hulk",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/5/a0/538615ca33ab0/standard_xlarge.jpg"
        }
    ]
}
```

* Error Case:
`Response 500`
```json=
{
    "message": "server error, please try it again"
}
```

### Single Hero [GET] /heroes/:heroId
* Request
```
curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET https://coolhahow.xyz/heroes/1
```
* Success Response:
`Response 200`
```json=
{
    "id": "1",
    "name": "Daredevil",
    "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg"
}
```

* Error Response:

 1. invalid id (id should be a positive interger)
`Response 400`
```json=
{
  "message": "the hero id should be a positive interger"
}
```
2. id out of range (id is greater than total count of heroes) 
`Response 400`
```json=
{
  "message": "maybe the input hero id out of range, please try other id again"
}
```
3. server error
`Response 500`
```json=
{
  "message": "server error, please try it again"
}
```

### Authenticated List Heroes [GET] /heroes
* Request
```
curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET https://coolhahow.xyz/heroes
```

* Success Response
`Response 200`
```json=
{
    "heroes": [
        {
            "id": "1",
            "name": "Daredevil",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
            "profile": {
                "str": 2,
                "int": 7,
                "agi": 9,
                "luk": 7
            }
        },
        {
            "id": "2",
            "name": "Thor",
            "image": "http://x.annihil.us/u/prod/marvel/i/mg/5/a0/537bc7036ab02/standard_xlarge.jpg",
            "profile": {
                "str": 8,
                "int": 2,
                "agi": 5,
                "luk": 9
            }
        },
        {
            "id": "3",
            "name": "Iron Man",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/a0/55b6a25e654e6/standard_xlarge.jpg",
            "profile": {
                "str": 6,
                "int": 9,
                "agi": 6,
                "luk": 9
            }
        },
        {
            "id": "4",
            "name": "Hulk",
            "image": "http://i.annihil.us/u/prod/marvel/i/mg/5/a0/538615ca33ab0/standard_xlarge.jpg",
            "profile": {
                "str": 10,
                "int": 1,
                "agi": 4,
                "luk": 2
            }
        }
    ]
}
```
* Error Response:
1. Name or Password incorrect
`Response 400`
```json=
{
    "message": "Please check Name & Password"
}
```
2. server error
`Response 500`
```json=
{
    "message": "server error, please try it again"
}
```
### Authenticated Single Heroes [GET] /heroes/:heroId
* Request
```
curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET https://coolhahow.xyz/heroes/1
```
* Success Response
`Response 200`
```json=
{
    "id": "1",
    "name": "Daredevil",
    "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
    "profile": {
        "str": 2,
        "int": 7,
        "agi": 9,
        "luk": 7
    }
}
```
* Error Response
1. invalid id (id should be a positive interger)
`Response 400`
```json=
{
  "message": "the hero id should be a positive interger"
}
```
2. id out of range (id is greater than total count of heroes) 
`Response 400`
```json=
{
  "message": "maybe the input hero id out of range, please try other id again"
}
```
3. Name or Password incorrect
`Response 400`
```json=
{
    "message": "Please check Name & Password"
}
```
4. server error
`Response 500`
```json=
{
  "message": "server error, please try it again"
}
``` 