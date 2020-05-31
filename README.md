# Simple Demo of using web-push java lib(简单的使用Java 实现的 web-push 的案例) 

**只针对 Chrome, 需要可以访问 Google**

## 1. web-push Github

https://github.com/web-push-libs/webpush-java



## 2. 启动项目

### 2.1 配置 Gcm key, public key, private key

- 在 `application-dev.yml` 配置这个三个 key
  - Gcm key: 注册firebase，创建一个项目，在 Settings 里面创建一个 **网络推送证书**
  - Public key 和 Private key: 在 test 包中，找到 `VapidGenerator` 类，执行 `testGenerate`方法，控制台会输出 public key 和 private key

- 在 `resources/script/index.js` 替换调 pushServerPublicKey 的值

## 2.2 打包

在 pom.xml 同目录，执行 mvn clean package，build 成功以后执行

```
java -Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=10809 -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=10809 -jar web-push-java-0.0.1-SNAPSHOT.jar
```

如果可以直接访问 Google 可以不需要 `-Dhttp.proxyHost` 这代理的配置