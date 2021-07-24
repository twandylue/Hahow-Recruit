# Assessment-hahow

### Assessment project for HaHow recruit


# Contents

* [Start Server](#Start-Server)
    * [Preparation](#Preparation)
    * [Local start](#Local-start)
* [Run API test](#Run-API-test)
* [Architecture](#Architecture)
* [Third party library](#Third-party-library)
* [Comment rule](#Comment-rule)
* [Difficulty](#Difficulty)
* [Bonus](#Bonus)
* [API Documentation](#API-Documentation)

## Start Server

### Preparation

```
git clone https://github.com/Tsai-Hsueh-Kuan/Hahow-Recruit.git
```

make sure to add **.env** file
ex:
```
NODE_ENV = 'production'
PORT = 3000
RATE_LIMIT_WINDOW = 1
RATE_LIMIT_COUNT = 10
CACHE_MODE='off'
HAHOWSERVER_HOST = 'https://hahow-recruit.herokuapp.com'
HAHOWSERVER_HEROESPATH = 'heroes'
HAHOWSERVER_AUTHPATH = 'auth'
REDIS_HOST='redis'
RERTY_LIMIT = 3
```
- CACHE_MODE :
    - normal mode use 'off'
    - need cache mode use 'on'
- REDIS_HOST : 
    - docker run use 'redis'  
    - local run use 'localhost'
- RERTY_LIMIT : 
    - retry count 0 hahow API server data error rate 1/3
    - recommended to use 3, data error rate approximate 1%

RERTY_LIMIT = 0

<img width="300" src="https://d3cek75nx38k91.cloudfront.net/hahow/10000times_retry0.png">


RERTY_LIMIT = 3

<img width="300" src="https://d3cek75nx38k91.cloudfront.net/hahow/10000times_retry3.png">

### Local start

1. **modify docker-compose.yaml**: 
comment out below code  
- `./ssl/coolhahow.xyz.crt:/etc/nginx/ssl/ssl.csr`
- `./ssl/coolhahow.xyz.key:/etc/nginx/ssl/ssl.key`
- `443:443`
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
Start docker first.  
`docker-compose up -d`

4. **Now you can call local api**:   
http://localhost/heroes  
http://localhost/heroes/:heroId

## Run API test

1. `npm run test`

## Architecture

### fargate mode

Use fargate to replace EC2 because this project is based on docker. Fargate can utilize vCPU & memory more accurately (take as much as you need), and there is no need to manage host (nginx is not required)
In addition, I manage the SSL certificate through certificate manager. It can directly set the load balancer to mount fargate to https
<img width="800" src="https://d3cek75nx38k91.cloudfront.net/hahow/hahow_fargate_arch.png">

## Third party library

* [express](https://www.npmjs.com/package/express): A light web framework of Node.js helps us to establish web server
* [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js, use this library to call hahow API service 
* [dotenv](https://www.npmjs.com/package/dotenv): A zero-dependency module that loads environment variables from a .env file into process.env. Used to manage environmental variables
* [redis](https://redis.io/): A in-memory key-value database, used to implement ratelimiter and cache mode
* [eslint](https://www.npmjs.com/package/eslint): A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. Used to manage coding style
* [nock](https://www.npmjs.com/package/nock): Can be used to test modules that perform HTTP requests in isolation. Used to simulate hahow API service
* [chai & chai http](https://www.npmjs.com/package/chai): Chai makes testing much easier by giving me lots of assertions I can run against my code. Chai-http works with assertions to perform HTTP integration test

## Comment rule

- Some code in order to emphasize purpose and explain ideas.(Ex: In cache mode use cache data directly)
- Explain the effects of third party library (Ex: nock)
- Some special cases for judging the response from third party api response.（Ex: if status = 200 , but data.code = 1000 ）
- The code of config file (nginx/node.conf, docker-compose.yaml) use comment to distinguish local or production environment

## Difficulty

### Hahow API simulates unstable state

Discovered that even if the status code is 200, Hahow’s API would provide wrong data.
Because of the above observation, I tested the API with artillery.io and found that the incorrect rate is about 1/3. Therefore, I designed retry mechanism in the code so the app can retry until it gets the right format of response. The maximum retry counts can be configured in **.env** file.

- RERTY_LIMIT : 
    - Hahow API server data error rate about 1/3.
    - Recommended to set RERTY_LIMIT to 3, then data error rate approximate 1%.

- authenticate :
    - If header's key has name or password, need to check authenticate. If authenticate fail, return statusCode 400.
    - If authenticate sussess but the response message is not 'OK', treated the request as not authenticate user.

### Fargate

I have heard of fargate when I was reading and looking for docker-related information, but I have never had time to do research. After learning about the content of this hahow assessment project, I felt that I must study and use it because it is really cool!

The biggest problem encountered is the SSL setting. Because the EC2 architecture carries the SSL certificate through nginx, but at fargate architecture, you can choose not to use nginx. Later, I found the information and said that it can be implemented through load balancer. Therefore, I host the domain through Route53 and point to the load balancer. In addition, I manage the SSL certificate through certificate manager. It can directly set the load balancer to mount fargate to https.

## Bonus

### rate limiter

In order to prevent high-rate DDoS attacks on API server, I designed rate limiter.
Implement rate limiter through redis, and change the limit frequency through **.env** file.
```
RERTY_LIMIT = 3
```

### cache mode control

If the API is reused a lot and there is no need for real-time data, you can change the .env file to 'on'.
```
CACHE_MODE = 'on'
```
The data can be temporarily stored in redis, saving repeated fishing traffic, and saving time.
(The default is 'off')

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
2. id out of range (no match id) 
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
2. id out of range (no match id) 
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